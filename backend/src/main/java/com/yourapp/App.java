package com.yourapp;

import java.sql.Connection;

import io.javalin.Javalin;

public class App {
    public static void main(String[] args) {

        System.out.println("🚀 Starting Backend...");

        Javalin app = Javalin.create(config -> {
            config.showJavalinBanner = false; // optional: cleaner logs
        }).start(8080);

        // Health endpoint for Docker healthcheck
        app.get("/health", ctx -> ctx.result("OK"));

        // Example root endpoint
        app.get("/", ctx -> ctx.result("Hello from plain Java backend!"));

        // Try DB connection
        try (Connection conn = Db.getConnection()) {
            System.out.println("✅ Connected to MySQL!");
        } catch (Exception e) {
            System.out.println("❌ DB connection failed: " + e.getMessage());
        }

        System.out.println("✅ Backend is ready!");
    }
}
