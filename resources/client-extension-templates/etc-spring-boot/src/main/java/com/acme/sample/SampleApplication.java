package com.acme.sample;

import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class SampleApplication {

    public static void main(String[] args) {
        SpringApplication.run(SampleApplication.class, args);
    }

    @GetMapping("/ready")
    public String ready() {
        return "READY";
    }

    @GetMapping("/api/message")
    public Map<String, String> message() {
        return Map.of(
            "project", "__PROJECT_TITLE__",
            "status", "ok"
        );
    }
}
