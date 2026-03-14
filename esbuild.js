const esbuild = require("esbuild");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    format: "cjs",
    platform: "node",
    sourcemap: !production,
    minify: production,
    outfile: "dist/extension.js",
    external: ["vscode"]
  });

  if (watch) {
    await ctx.watch();
    console.log("Watching...");
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main();
