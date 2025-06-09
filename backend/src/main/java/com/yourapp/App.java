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

        // TEST Protected endpoint
        app.get("/api/protected/hello", ctx -> {
            String username = ctx.attribute("username");
            ctx.result("Hello, " + username + "! You have accessed a protected endpoint.");
        });

        // LOGIN endpoint
        app.post("/api/auth/login", ctx -> {
            LoginDto loginDto = ctx.bodyAsClass(LoginDto.class);

            try (Connection conn = Db.getConnection()) {
                // PREPARED STATEMENT — safe from SQL injection
                String sql = "SELECT password, role FROM users WHERE email = ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setString(1, loginDto.getEmail());
                ResultSet rs = stmt.executeQuery();

                if (rs.next()) {
                    String storedPassword = rs.getString("password");
                    String role = rs.getString("role");

                    if (storedPassword.equals(loginDto.getPassword())) {
                        String token = tokenProvider.generateToken(loginDto.getEmail(), role); // <-- pass role!
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

        app.before("/api/protected/*", ctx -> {
            String header = ctx.header("Authorization");

            if (header == null || !header.startsWith("Bearer ")) {
                ctx.status(401).result("Missing or invalid Authorization header");
                return;
            }

            String token = header.substring(7);

            if (!tokenProvider.validateToken(token)) {
                ctx.status(401).result("Invalid token");
                return;
            }

            // Optional: extract username/email from token and store it in ctx
            String username = tokenProvider.getUsernameFromJWT(token);
            ctx.attribute("username", username); // You can access it in handlers later
        });

        System.out.println("✅ Backend is ready!");
    }
}
