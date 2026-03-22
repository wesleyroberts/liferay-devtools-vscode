package com.acme.sample;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@SpringBootApplication
@EnableScheduling
public class SampleCronApplication implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(SampleCronApplication.class, args);
    }

    @Override
    public void run(String... args) {
        System.out.println("__PROJECT_TITLE__ started.");
    }

    @Scheduled(cron = "0 */5 * * * *")
    public void execute() {
        System.out.println("__PROJECT_TITLE__ cron executed.");
    }
}
