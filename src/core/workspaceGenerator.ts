import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";
import { DockerImageOption } from "./versions";
import { copyDir } from "../utils/fs";

export interface GenerateWorkspaceParams {
  context: vscode.ExtensionContext;
  workspaceDir: string;
  workspaceName: string;
  productVersion: string;
  dockerImage: DockerImageOption;
}

export async function generateWorkspace(
  params: GenerateWorkspaceParams
): Promise<void> {
  const { context, workspaceDir, workspaceName, productVersion, dockerImage } =
    params;

  const templateDir = path.join(
    context.extensionPath,
    "resources",
    "workspace-template"
  );

  const requiredFiles = [
    path.join(templateDir, "gradlew"),
    path.join(templateDir, "gradlew.bat"),
    path.join(templateDir, "gradle", "wrapper", "gradle-wrapper.jar"),
    path.join(templateDir, "gradle", "wrapper", "gradle-wrapper.properties")
  ];

  for (const file of requiredFiles) {
    try {
      await fs.access(file);
    } catch {
      throw new Error(
        `Arquivo obrigatório do Gradle Wrapper não encontrado: ${file}`
      );
    }
  }

  await fs.mkdir(workspaceDir, { recursive: true });
  await copyDir(templateDir, workspaceDir);

  const settingsGradle = `buildscript {
    repositories {
        mavenLocal()
        mavenCentral()
        maven {
            url "https://repository.liferay.com/nexus/content/groups/public"
        }
    }

    dependencies {
        classpath group: "com.liferay", name: "com.liferay.gradle.plugins.workspace", version: "latest.release"
    }
}

apply plugin: "com.liferay.workspace"

rootProject.name = "${workspaceName}"
`;

 const gradleProperties = `
liferay.workspace.bundle.dist.include.metadata=true
liferay.workspace.modules.dir=modules
liferay.workspace.themes.dir=themes
liferay.workspace.wars.dir=modules
microsoft.translator.subscription.key=
liferay.workspace.product=${productVersion}
target.platform.index.sources=false
`;

  const gitignore = `/bundles/
/.gradle/
/build/
/out/
/target/
node_modules/
.DS_Store
`;

  await fs.writeFile(
    path.join(workspaceDir, "settings.gradle"),
    settingsGradle,
    "utf8"
  );

  await fs.writeFile(
    path.join(workspaceDir, "gradle.properties"),
    gradleProperties,
    "utf8"
  );

  await fs.writeFile(
    path.join(workspaceDir, ".gitignore"),
    gitignore,
    "utf8"
  );

  await createWorkspaceDirectories(workspaceDir, dockerImage);
}

async function createWorkspaceDirectories(
  workspaceDir: string,
  dockerImage: DockerImageOption
): Promise<void> {
  const directories = [
    "bundles",
    "modules",
    "configs",
    "client-extensions",
    "themes",
    "docker"
  ];

  for (const dir of directories) {
    await fs.mkdir(path.join(workspaceDir, dir), { recursive: true });
  }

  await createConfigDirectories(workspaceDir);
  await createDockerStructure(workspaceDir, dockerImage);
}

async function createConfigDirectories(workspaceDir: string): Promise<void> {
  const configDirectories = [
    "common",
    "dev",
    "docker",
    "local",
    "prod",
    "uat"
  ];

  for (const directory of configDirectories) {
    const configDir = path.join(workspaceDir, "configs", directory);

    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      path.join(configDir, "portal-ext.properties"),
      buildPortalExtProperties(directory),
      "utf8"
    );
  }
}

function buildPortalExtProperties(directory: string): string {
  if (directory !== "docker") {
    return "";
  }

  return `jdbc.default.driverClassName=com.mysql.cj.jdbc.Driver
jdbc.default.url=jdbc:mysql://mysql:3306/lportal?useUnicode=true&characterEncoding=UTF-8&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
jdbc.default.username=liferay
jdbc.default.password=liferay
`;
}

async function createDockerStructure(
  workspaceDir: string,
  dockerImage: DockerImageOption
): Promise<void> {
  const dockerDir = path.join(workspaceDir, "docker");
  const nginxDir = path.join(dockerDir, "nginx");

  await fs.mkdir(nginxDir, { recursive: true });

  await fs.writeFile(
    path.join(dockerDir, "docker-compose.yaml"),
    buildDockerCompose(dockerImage),
    "utf8"
  );

  await fs.writeFile(
    path.join(nginxDir, "default.conf"),
    buildNginxConfig(),
    "utf8"
  );
}

function buildDockerCompose(dockerImage: DockerImageOption): string {
  return `services:
  liferay:
    image: ${dockerImage.repository}:${dockerImage.tag}-slim
    depends_on:
      mysql:
        condition: service_healthy
      elasticsearch:
        condition: service_started
    environment:
      LIFERAY_NETWORK_HOST_ADDRESSES: http://elasticsearch:9200
      LIFERAY_JVM_OPTS: -Xms2g -Xmx2g
    ports:
      - "8080:8080"
      - "11311:11311"
    volumes:
      - ../configs/docker/portal-ext.properties:/mnt/liferay/files/portal-ext.properties:ro
      - ../bundles/deploy:/mnt/liferay/deploy
      - liferay_data:/opt/liferay/data
    networks:
      - liferay
    healthcheck:
      test: ["CMD-SHELL", "curl -fsS http://localhost:8080 >/dev/null || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 20
      start_period: 240s

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.28
    environment:
      discovery.type: single-node
      ES_JAVA_OPTS: -Xms1g -Xmx1g
      xpack.security.enabled: "false"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - liferay

  mysql:
    image: mysql:8.0
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
    environment:
      MYSQL_DATABASE: lportal
      MYSQL_USER: liferay
      MYSQL_PASSWORD: liferay
      MYSQL_ROOT_PASSWORD: root
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - liferay
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-proot"]
      interval: 15s
      timeout: 5s
      retries: 20

  nginx:
    image: nginx:1.27-alpine
    depends_on:
      liferay:
        condition: service_healthy
    ports:
      - "80:80"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    networks:
      - liferay

volumes:
  liferay_data:
  elasticsearch_data:
  mysql_data:

networks:
  liferay:
    driver: bridge
`;
}

function buildNginxConfig(): string {
  return `server {
    listen 80;
    server_name _;
    client_max_body_size 200m;

    location / {
        proxy_pass http://liferay:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 60s;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }
}
`;
}
