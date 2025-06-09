package com.yourapp;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import com.yourapp.Dto.JWTTokenDto;
import com.yourapp.Dto.LoginDto;
import com.yourapp.Security.JWTTokenProvider;

import io.javalin.Javalin;

public class App {  // <--- This was missing!

    public static void main(String[] args) {

        System.out.println("🚀 Starting Backend...");

        Javalin app = Javalin.create(config -> {
            config.showJavalinBanner = false;
            config.plugins.enableCors(cors -> {
                cors.add(it -> {
                    it.anyHost(); // Allow CORS for frontend
                });
            });
        }).start(8080);

        // Health endpoint
        app.get("/health", ctx -> ctx.result("OK"));

        // Root endpoint
        app.get("/", ctx -> ctx.result("Hello from plain Java backend!"));

        // Try DB connection
        try (Connection conn = Db.getConnection()) {
            System.out.println("✅ Connected to MySQL!");
        } catch (Exception e) {
            System.out.println("❌ DB connection failed: " + e.getMessage());
        }

        // JWT provider instance
        JWTTokenProvider tokenProvider = new JWTTokenProvider();

        // LOGIN endpoint

        app.post("/api/auth/login", ctx -> {
            LoginDto loginDto = ctx.bodyAsClass(LoginDto.class);

            try (Connection conn = Db.getConnection()) {
                // PREPARED STATEMENT — safe from SQL injection
                String sql = "SELECT password FROM users WHERE email = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setString(1, loginDto.getUsername());
                ResultSet rs = stmt.executeQuery();

                if (rs.next()) {
                    String storedPassword = rs.getString("password");

                    // For now simple string comparison, later we add password hashing (bcrypt)
                    if (storedPassword.equals(loginDto.getPassword())) {
                        String token = tokenProvider.generateToken(loginDto.getUsername());
                        ctx.json(new JWTTokenDto(token));
                    } else {
                        ctx.status(401).result("Invalid password");
                    }
                } else {
                    ctx.status(401).result("User not found");
                }

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });



        

        System.out.println("✅ Backend is ready!");
    }
}
