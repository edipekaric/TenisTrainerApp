package com.yourapp;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

        
        // Add this BEFORE your existing app.before("/api/time-slots/*", ...)

        // Auth for exact /api/time-slots path (POST requests)
        app.before("/api/time-slots", ctx -> {
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

            String username = tokenProvider.getUsernameFromJWT(token);
            ctx.attribute("username", username);
        });

        // Keep your existing middleware for sub-paths
        app.before("/api/time-slots/*", ctx -> {
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

            String username = tokenProvider.getUsernameFromJWT(token);
            ctx.attribute("username", username);
        });



        // GET my booked time slots
        app.get("/api/time-slots/my", ctx -> {
            String username = ctx.attribute("username");
            if (username == null) {
                ctx.status(401).result("Unauthorized");
                return;
            }

            try (Connection conn = Db.getConnection()) {
                String sql = "SELECT ts.id, ts.date, ts.start_time, ts.end_time, ts.is_booked, ts.booked_by " +
                            "FROM time_slots ts " +
                            "JOIN users u ON ts.booked_by = u.id " +
                            "WHERE u.email = ? " +
                            "ORDER BY ts.date ASC, ts.start_time ASC";



                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setString(1, username);
                ResultSet rs = stmt.executeQuery();

                List<Map<String, Object>> slots = new ArrayList<>();

                while (rs.next()) {
                    Map<String, Object> slot = new HashMap<>();
                    slot.put("id", rs.getInt("id"));
                    slot.put("date", rs.getDate("date").toString());
                    slot.put("start_time", rs.getString("start_time"));
                    slot.put("end_time", rs.getString("end_time"));
                    slot.put("is_booked", rs.getBoolean("is_booked"));
                    slot.put("booked_by", rs.getObject("booked_by"));
                    slots.add(slot);
                }

                ctx.json(slots);

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });

        // GET free time slots for next X days
        app.get("/api/time-slots/free", ctx -> {
            String daysParam = ctx.queryParam("days");
            int days = daysParam != null ? Integer.parseInt(daysParam) : 7;

            try (Connection conn = Db.getConnection()) {
                String sql = "SELECT id, date, start_time, end_time, is_booked, booked_by " +
                            "FROM time_slots " +
                            "WHERE is_booked = false " +
                            "AND date >= CURDATE() " +
                            "AND date <= DATE_ADD(CURDATE(), INTERVAL ? DAY) " +
                            "ORDER BY date ASC, start_time ASC";

                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, days);
                ResultSet rs = stmt.executeQuery();

                List<Map<String, Object>> slots = new ArrayList<>();

                while (rs.next()) {
                    Map<String, Object> slot = new HashMap<>();
                    slot.put("id", rs.getInt("id"));
                    slot.put("date", rs.getDate("date").toString());
                    slot.put("start_time", rs.getString("start_time"));
                    slot.put("end_time", rs.getString("end_time"));
                    slot.put("is_booked", rs.getBoolean("is_booked"));
                    slot.put("booked_by", rs.getObject("booked_by"));
                    slots.add(slot);
                }

                ctx.json(slots);

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });

        // POST Add new time slot (Admin)
        app.post("/api/time-slots", ctx -> {
            String username = ctx.attribute("username");
            if (username == null) {
                ctx.status(401).result("Unauthorized");
                return;
            }

            try (Connection conn = Db.getConnection()) {
                // Check if user is ADMIN
                String roleSql = "SELECT role FROM users WHERE email = ?";
                PreparedStatement roleStmt = conn.prepareStatement(roleSql);
                roleStmt.setString(1, username);
                ResultSet roleRs = roleStmt.executeQuery();

                if (!roleRs.next() || !"ADMIN".equals(roleRs.getString("role"))) {
                    ctx.status(403).result("Forbidden: Admins only");
                    return;
                }

                // Read body
                Map<String, Object> body = ctx.bodyAsClass(Map.class);
                String date = (String) body.get("date");
                String start_time = (String) body.get("start_time");
                String end_time = (String) body.get("end_time");


                String insertSql = "INSERT INTO time_slots (date, start_time, end_time, is_booked, booked_by) " +
                                "VALUES (?, ?, ?, false, NULL)";

                PreparedStatement insertStmt = conn.prepareStatement(insertSql);
                insertStmt.setString(1, date);
                insertStmt.setString(2, start_time);
                insertStmt.setString(3, end_time);
                insertStmt.executeUpdate();

                ctx.result("Time slot added");

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });



        // POST Book time slot (User books a slot)
        app.post("/api/time-slots/book/{id}", ctx -> {
            String username = ctx.attribute("username");
            if (username == null) {
                ctx.status(401).result("Unauthorized");
                return;
            }

            int slotId = Integer.parseInt(ctx.pathParam("id"));

            try (Connection conn = Db.getConnection()) {
                // Get user ID
                String userIdSql = "SELECT id FROM users WHERE email = ?";
                PreparedStatement userStmt = conn.prepareStatement(userIdSql);
                userStmt.setString(1, username);
                ResultSet userRs = userStmt.executeQuery();

                if (!userRs.next()) {
                    ctx.status(500).result("User not found");
                    return;
                }

                int userId = userRs.getInt("id");

                // Try to book slot
                String updateSql = "UPDATE time_slots SET is_booked = true, booked_by = ? WHERE id = ? AND is_booked = false";
                PreparedStatement updateStmt = conn.prepareStatement(updateSql);
                updateStmt.setInt(1, userId);
                updateStmt.setInt(2, slotId);
                int updatedRows = updateStmt.executeUpdate();

                if (updatedRows > 0) {
                    ctx.result("Slot booked successfully");
                } else {
                    ctx.status(400).result("Slot already booked or does not exist");
                }

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });

        // Add this endpoint to your Java backend (after your POST endpoints)

        // DELETE Remove time slot (Admin only)
        app.delete("/api/time-slots/{id}", ctx -> {
            String username = ctx.attribute("username");
            if (username == null) {
                ctx.status(401).result("Unauthorized");
                return;
            }

            int slotId = Integer.parseInt(ctx.pathParam("id"));

            try (Connection conn = Db.getConnection()) {
                // Check if user is ADMIN
                String roleSql = "SELECT role FROM users WHERE email = ?";
                PreparedStatement roleStmt = conn.prepareStatement(roleSql);
                roleStmt.setString(1, username);
                ResultSet roleRs = roleStmt.executeQuery();

                if (!roleRs.next() || !"ADMIN".equals(roleRs.getString("role"))) {
                    ctx.status(403).result("Forbidden: Admins only");
                    return;
                }

                // Check if slot exists and whether it's booked
                String checkSql = "SELECT is_booked FROM time_slots WHERE id = ?";
                PreparedStatement checkStmt = conn.prepareStatement(checkSql);
                checkStmt.setInt(1, slotId);
                ResultSet checkRs = checkStmt.executeQuery();

                if (!checkRs.next()) {
                    ctx.status(404).result("Time slot not found");
                    return;
                }

                boolean isBooked = checkRs.getBoolean("is_booked");
                
                // Optional: Prevent deletion of booked slots (uncomment if desired)
                // if (isBooked) {
                //     ctx.status(400).result("Cannot delete booked time slot");
                //     return;
                // }

                // Delete the time slot
                String deleteSql = "DELETE FROM time_slots WHERE id = ?";
                PreparedStatement deleteStmt = conn.prepareStatement(deleteSql);
                deleteStmt.setInt(1, slotId);
                int deletedRows = deleteStmt.executeUpdate();

                if (deletedRows > 0) {
                    ctx.result("Time slot deleted successfully");
                } else {
                    ctx.status(404).result("Time slot not found");
                }

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });



        // Replace your existing /api/time-slots/all endpoint with this updated version

        // GET all time slots for next X days (Admin only - shows both free and booked)
        app.get("/api/time-slots/all", ctx -> {
            String username = ctx.attribute("username");
            if (username == null) {
                ctx.status(401).result("Unauthorized");
                return;
            }

            try (Connection conn = Db.getConnection()) {
                // Check if user is ADMIN
                String roleSql = "SELECT role FROM users WHERE email = ?";
                PreparedStatement roleStmt = conn.prepareStatement(roleSql);
                roleStmt.setString(1, username);
                ResultSet roleRs = roleStmt.executeQuery();

                if (!roleRs.next() || !"ADMIN".equals(roleRs.getString("role"))) {
                    ctx.status(403).result("Forbidden: Admins only");
                    return;
                }

                String daysParam = ctx.queryParam("days");
                int days = daysParam != null ? Integer.parseInt(daysParam) : 7;

                // Updated SQL with LEFT JOIN to get user information
                String sql = "SELECT ts.id, ts.date, ts.start_time, ts.end_time, ts.is_booked, ts.booked_by, " +
                            "u.first_name, u.last_name, u.email " +
                            "FROM time_slots ts " +
                            "LEFT JOIN users u ON ts.booked_by = u.id " +
                            "WHERE ts.date >= CURDATE() " +
                            "AND ts.date <= DATE_ADD(CURDATE(), INTERVAL ? DAY) " +
                            "ORDER BY ts.date ASC, ts.start_time ASC";

                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, days);
                ResultSet rs = stmt.executeQuery();

                List<Map<String, Object>> slots = new ArrayList<>();

                while (rs.next()) {
                    Map<String, Object> slot = new HashMap<>();
                    slot.put("id", rs.getInt("id"));
                    slot.put("date", rs.getDate("date").toString());
                    slot.put("start_time", rs.getString("start_time"));
                    slot.put("end_time", rs.getString("end_time"));
                    slot.put("is_booked", rs.getBoolean("is_booked"));
                    slot.put("booked_by", rs.getObject("booked_by"));
                    
                    // Add user information if slot is booked
                    if (rs.getObject("booked_by") != null) {
                        Map<String, Object> bookedByUser = new HashMap<>();
                        bookedByUser.put("first_name", rs.getString("first_name"));
                        bookedByUser.put("last_name", rs.getString("last_name"));
                        bookedByUser.put("email", rs.getString("email"));
                        slot.put("booked_by_user", bookedByUser);
                    } else {
                        slot.put("booked_by_user", null);
                    }
                    
                    slots.add(slot);
                }

                ctx.json(slots);

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });







        // Add this to your Java backend after your existing endpoints
        // Add authentication middleware for /api/users/* routes first

        // Auth middleware for users endpoints
        app.before("/api/users/*", ctx -> {
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

            String username = tokenProvider.getUsernameFromJWT(token);
            ctx.attribute("username", username);
        });

        // GET all users (Admin only)
        app.get("/api/users/all", ctx -> {
            String username = ctx.attribute("username");
            if (username == null) {
                ctx.status(401).result("Unauthorized");
                return;
            }

            try (Connection conn = Db.getConnection()) {
                // Check if user is ADMIN
                String roleSql = "SELECT role FROM users WHERE email = ?";
                PreparedStatement roleStmt = conn.prepareStatement(roleSql);
                roleStmt.setString(1, username);
                ResultSet roleRs = roleStmt.executeQuery();

                if (!roleRs.next() || !"ADMIN".equals(roleRs.getString("role"))) {
                    ctx.status(403).result("Forbidden: Admins only");
                    return;
                }

                // Get all users with all available columns
                String sql = "SELECT id, first_name, last_name, email, phone, balance, role " +
                            "FROM users " +
                            "ORDER BY id DESC";

                PreparedStatement stmt = conn.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery();

                List<Map<String, Object>> users = new ArrayList<>();

                while (rs.next()) {
                    Map<String, Object> user = new HashMap<>();
                    user.put("id", rs.getInt("id"));
                    user.put("first_name", rs.getString("first_name"));
                    user.put("last_name", rs.getString("last_name"));
                    user.put("email", rs.getString("email"));
                    user.put("phone", rs.getString("phone"));
                    user.put("balance", rs.getBigDecimal("balance"));
                    user.put("role", rs.getString("role"));
                    user.put("created_at", null); // Set to null since column doesn't exist
                    
                    users.add(user);
                }

                ctx.json(users);

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });





        // GET user profile (for current logged-in user)
        app.get("/api/users/profile", ctx -> {
            String username = ctx.attribute("username");
            if (username == null) {
                ctx.status(401).result("Unauthorized");
                return;
            }

            try (Connection conn = Db.getConnection()) {
                // Get user profile with all available columns
                String sql = "SELECT id, first_name, last_name, email, phone, balance, role " +
                            "FROM users " +
                            "WHERE email = ?";

                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setString(1, username);
                ResultSet rs = stmt.executeQuery();

                if (rs.next()) {
                    Map<String, Object> user = new HashMap<>();
                    user.put("id", rs.getInt("id"));
                    user.put("first_name", rs.getString("first_name"));
                    user.put("last_name", rs.getString("last_name"));
                    user.put("email", rs.getString("email"));
                    user.put("phone", rs.getString("phone"));
                    user.put("balance", rs.getBigDecimal("balance"));
                    user.put("role", rs.getString("role"));
                    user.put("created_at", null); // Set to null since column doesn't exist
                    
                    ctx.json(user);
                } else {
                    ctx.status(404).result("User not found");
                }

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });




        // PUT update user profile (for current logged-in user)
        app.put("/api/users/profile", ctx -> {
            String username = ctx.attribute("username");
            if (username == null) {
                ctx.status(401).result("Unauthorized");
                return;
            }

            try (Connection conn = Db.getConnection()) {
                // Read body
                Map<String, Object> body = ctx.bodyAsClass(Map.class);
                String firstName = (String) body.get("first_name");
                String lastName = (String) body.get("last_name");
                String newEmail = (String) body.get("email");
                String phone = (String) body.get("phone");

                if (firstName == null || lastName == null || newEmail == null) {
                    ctx.status(400).result("Missing required fields");
                    return;
                }

                // Check if new email is already taken by another user
                if (!newEmail.equals(username)) {
                    String checkEmailSql = "SELECT id FROM users WHERE email = ? AND email != ?";
                    PreparedStatement checkStmt = conn.prepareStatement(checkEmailSql);
                    checkStmt.setString(1, newEmail);
                    checkStmt.setString(2, username);
                    ResultSet checkRs = checkStmt.executeQuery();

                    if (checkRs.next()) {
                        ctx.status(400).result("Email already taken by another user");
                        return;
                    }
                }

                // Update user profile
                String updateSql = "UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE email = ?";
                PreparedStatement updateStmt = conn.prepareStatement(updateSql);
                updateStmt.setString(1, firstName);
                updateStmt.setString(2, lastName);
                updateStmt.setString(3, newEmail);
                updateStmt.setString(4, phone);
                updateStmt.setString(5, username);
                
                int updatedRows = updateStmt.executeUpdate();

                if (updatedRows > 0) {
                    ctx.result("Profile updated successfully");
                } else {
                    ctx.status(404).result("User not found");
                }

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });

        // POST admin register new user (Admin only)
        app.post("/api/users/admin/register", ctx -> {
            String username = ctx.attribute("username");
            if (username == null) {
                ctx.status(401).result("Unauthorized");
                return;
            }

            try (Connection conn = Db.getConnection()) {
                // Check if user is ADMIN
                String roleSql = "SELECT role FROM users WHERE email = ?";
                PreparedStatement roleStmt = conn.prepareStatement(roleSql);
                roleStmt.setString(1, username);
                ResultSet roleRs = roleStmt.executeQuery();

                if (!roleRs.next() || !"ADMIN".equals(roleRs.getString("role"))) {
                    ctx.status(403).result("Forbidden: Admins only");
                    return;
                }

                // Read body
                Map<String, Object> body = ctx.bodyAsClass(Map.class);
                String firstName = (String) body.get("first_name");
                String lastName = (String) body.get("last_name");
                String email = (String) body.get("email");
                String password = (String) body.get("password");
                String phone = (String) body.get("phone");
                String role = (String) body.get("role");
                Object balanceObj = body.get("balance");

                if (firstName == null || lastName == null || email == null || password == null || role == null) {
                    ctx.status(400).result("Missing required fields");
                    return;
                }

                // Validate role
                if (!"USER".equals(role) && !"ADMIN".equals(role)) {
                    ctx.status(400).result("Invalid role. Must be USER or ADMIN");
                    return;
                }

                // Parse balance
                double balance = 0.0;
                if (balanceObj != null) {
                    try {
                        balance = Double.parseDouble(balanceObj.toString());
                    } catch (NumberFormatException e) {
                        ctx.status(400).result("Invalid balance format");
                        return;
                    }
                }

                // Check if email already exists
                String checkEmailSql = "SELECT id FROM users WHERE email = ?";
                PreparedStatement checkStmt = conn.prepareStatement(checkEmailSql);
                checkStmt.setString(1, email.toLowerCase());
                ResultSet checkRs = checkStmt.executeQuery();

                if (checkRs.next()) {
                    ctx.status(400).result("Email already exists");
                    return;
                }

                // Hash password (you should use proper password hashing)
                String hashedPassword = password; // In production, use BCrypt or similar

                // Insert new user
                String insertSql = "INSERT INTO users (first_name, last_name, email, password, phone, role, balance) VALUES (?, ?, ?, ?, ?, ?, ?)";
                PreparedStatement insertStmt = conn.prepareStatement(insertSql);
                insertStmt.setString(1, firstName);
                insertStmt.setString(2, lastName);
                insertStmt.setString(3, email.toLowerCase());
                insertStmt.setString(4, hashedPassword);
                insertStmt.setString(5, phone);
                insertStmt.setString(6, role);
                insertStmt.setDouble(7, balance);

                int insertedRows = insertStmt.executeUpdate();

                if (insertedRows > 0) {
                    ctx.result("User registered successfully");
                } else {
                    ctx.status(500).result("Failed to register user");
                }

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });

        // PUT admin reset user password (Admin only)
        app.put("/api/users/admin/reset-password", ctx -> {
            String username = ctx.attribute("username");
            if (username == null) {
                ctx.status(401).result("Unauthorized");
                return;
            }

            try (Connection conn = Db.getConnection()) {
                // Check if user is ADMIN
                String roleSql = "SELECT role FROM users WHERE email = ?";
                PreparedStatement roleStmt = conn.prepareStatement(roleSql);
                roleStmt.setString(1, username);
                ResultSet roleRs = roleStmt.executeQuery();

                if (!roleRs.next() || !"ADMIN".equals(roleRs.getString("role"))) {
                    ctx.status(403).result("Forbidden: Admins only");
                    return;
                }

                // Read body
                Map<String, Object> body = ctx.bodyAsClass(Map.class);
                Object userIdObj = body.get("user_id");
                String newPassword = (String) body.get("new_password");

                if (userIdObj == null || newPassword == null) {
                    ctx.status(400).result("Missing required fields");
                    return;
                }

                int userId;
                try {
                    userId = Integer.parseInt(userIdObj.toString());
                } catch (NumberFormatException e) {
                    ctx.status(400).result("Invalid user ID format");
                    return;
                }

                // Validate password length
                if (newPassword.length() < 6) {
                    ctx.status(400).result("Password must be at least 6 characters long");
                    return;
                }

                // Check if user exists
                String checkUserSql = "SELECT id FROM users WHERE id = ?";
                PreparedStatement checkStmt = conn.prepareStatement(checkUserSql);
                checkStmt.setInt(1, userId);
                ResultSet checkRs = checkStmt.executeQuery();

                if (!checkRs.next()) {
                    ctx.status(404).result("User not found");
                    return;
                }

                // Hash password (in production, use BCrypt or similar)
                String hashedPassword = newPassword; // In production, use proper password hashing

                // Update user password
                String updateSql = "UPDATE users SET password = ? WHERE id = ?";
                PreparedStatement updateStmt = conn.prepareStatement(updateSql);
                updateStmt.setString(1, hashedPassword);
                updateStmt.setInt(2, userId);
                
                int updatedRows = updateStmt.executeUpdate();

                if (updatedRows > 0) {
                    ctx.result("Password reset successfully");
                } else {
                    ctx.status(500).result("Failed to reset password");
                }

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });

        // Auth middleware for transaction endpoints
        app.before("/api/transactions/*", ctx -> {
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

            String username = tokenProvider.getUsernameFromJWT(token);
            ctx.attribute("username", username);
        });

        // POST create transaction (Admin only)
        app.post("/api/transactions/create", ctx -> {
            String username = ctx.attribute("username");
            if (username == null) {
                ctx.status(401).result("Unauthorized");
                return;
            }

            try (Connection conn = Db.getConnection()) {
                // Check if user is ADMIN
                String roleSql = "SELECT role FROM users WHERE email = ?";
                PreparedStatement roleStmt = conn.prepareStatement(roleSql);
                roleStmt.setString(1, username);
                ResultSet roleRs = roleStmt.executeQuery();

                if (!roleRs.next() || !"ADMIN".equals(roleRs.getString("role"))) {
                    ctx.status(403).result("Forbidden: Admins only");
                    return;
                }

                // Read body
                Map<String, Object> body = ctx.bodyAsClass(Map.class);
                Object userIdObj = body.get("user_id");
                String transactionType = (String) body.get("transaction_type");
                Object amountObj = body.get("amount");
                String description = (String) body.get("description");

                if (userIdObj == null || transactionType == null || amountObj == null || description == null) {
                    ctx.status(400).result("Missing required fields");
                    return;
                }

                // Parse values
                int userId;
                double amount;
                try {
                    userId = Integer.parseInt(userIdObj.toString());
                    amount = Double.parseDouble(amountObj.toString());
                } catch (NumberFormatException e) {
                    ctx.status(400).result("Invalid number format");
                    return;
                }

                // Validate transaction type
                if (!"ADD".equals(transactionType) && !"SUBTRACT".equals(transactionType)) {
                    ctx.status(400).result("Invalid transaction type. Must be ADD or SUBTRACT");
                    return;
                }

                // Validate amount
                if (amount <= 0) {
                    ctx.status(400).result("Amount must be positive");
                    return;
                }

                // Get current user balance
                String balanceSql = "SELECT balance FROM users WHERE id = ?";
                PreparedStatement balanceStmt = conn.prepareStatement(balanceSql);
                balanceStmt.setInt(1, userId);
                ResultSet balanceRs = balanceStmt.executeQuery();

                if (!balanceRs.next()) {
                    ctx.status(404).result("User not found");
                    return;
                }

                double currentBalance = balanceRs.getDouble("balance");
                double newBalance;

                if ("ADD".equals(transactionType)) {
                    newBalance = currentBalance + amount;
                } else { // SUBTRACT
                    newBalance = currentBalance - amount;
                    // Allow negative balances, but warn if it goes below 0
                    if (newBalance < 0) {
                        // You can uncomment this line if you want to prevent negative balances
                        // ctx.status(400).result("Insufficient balance for this transaction");
                        // return;
                    }
                }

                // Start transaction
                conn.setAutoCommit(false);

                try {
                    // Insert transaction record
                    String insertTransactionSql = "INSERT INTO transactions (user_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)";
                    PreparedStatement insertTransactionStmt = conn.prepareStatement(insertTransactionSql);
                    insertTransactionStmt.setInt(1, userId);
                    insertTransactionStmt.setDouble(2, amount);
                    insertTransactionStmt.setString(3, transactionType);
                    insertTransactionStmt.setString(4, description);
                    insertTransactionStmt.executeUpdate();

                    // Update user balance
                    String updateBalanceSql = "UPDATE users SET balance = ? WHERE id = ?";
                    PreparedStatement updateBalanceStmt = conn.prepareStatement(updateBalanceSql);
                    updateBalanceStmt.setDouble(1, newBalance);
                    updateBalanceStmt.setInt(2, userId);
                    updateBalanceStmt.executeUpdate();

                    // Commit transaction
                    conn.commit();
                    ctx.result("Transaction processed successfully");

                } catch (Exception e) {
                    // Rollback on error
                    conn.rollback();
                    throw e;
                } finally {
                    conn.setAutoCommit(true);
                }

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });

        // GET all transactions (Admin only)
        app.get("/api/transactions/all", ctx -> {
            String username = ctx.attribute("username");
            if (username == null) {
                ctx.status(401).result("Unauthorized");
                return;
            }

            try (Connection conn = Db.getConnection()) {
                // Check if user is ADMIN
                String roleSql = "SELECT role FROM users WHERE email = ?";
                PreparedStatement roleStmt = conn.prepareStatement(roleSql);
                roleStmt.setString(1, username);
                ResultSet roleRs = roleStmt.executeQuery();

                if (!roleRs.next() || !"ADMIN".equals(roleRs.getString("role"))) {
                    ctx.status(403).result("Forbidden: Admins only");
                    return;
                }

                // Get all transactions with user info
                String sql = "SELECT t.id, t.user_id, t.amount, t.transaction_type, t.description, " +
                            "u.first_name, u.last_name, u.email " +
                            "FROM transactions t " +
                            "JOIN users u ON t.user_id = u.id " +
                            "ORDER BY t.id DESC";

                PreparedStatement stmt = conn.prepareStatement(sql);
                ResultSet rs = stmt.executeQuery();

                List<Map<String, Object>> transactions = new ArrayList<>();

                while (rs.next()) {
                    Map<String, Object> transaction = new HashMap<>();
                    transaction.put("id", rs.getInt("id"));
                    transaction.put("user_id", rs.getInt("user_id"));
                    transaction.put("amount", rs.getDouble("amount"));
                    transaction.put("transaction_type", rs.getString("transaction_type"));
                    transaction.put("description", rs.getString("description"));
                    transaction.put("user_name", rs.getString("first_name") + " " + rs.getString("last_name"));
                    transaction.put("user_email", rs.getString("email"));
                    
                    transactions.add(transaction);
                }

                ctx.json(transactions);

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });

        // GET transactions for specific user
        app.get("/api/transactions/user/{userId}", ctx -> {
            String username = ctx.attribute("username");
            if (username == null) {
                ctx.status(401).result("Unauthorized");
                return;
            }

            try (Connection conn = Db.getConnection()) {
                // Check if user is ADMIN or requesting their own transactions
                String userIdStr = ctx.pathParam("userId");
                int requestedUserId = Integer.parseInt(userIdStr);

                String userCheckSql = "SELECT id, role FROM users WHERE email = ?";
                PreparedStatement userCheckStmt = conn.prepareStatement(userCheckSql);
                userCheckStmt.setString(1, username);
                ResultSet userCheckRs = userCheckStmt.executeQuery();

                if (!userCheckRs.next()) {
                    ctx.status(404).result("User not found");
                    return;
                }

                int currentUserId = userCheckRs.getInt("id");
                String currentUserRole = userCheckRs.getString("role");

                // Only allow if admin or user requesting their own transactions
                if (!"ADMIN".equals(currentUserRole) && currentUserId != requestedUserId) {
                    ctx.status(403).result("Forbidden: Can only view your own transactions");
                    return;
                }

                // Get transactions for the user
                String sql = "SELECT id, user_id, amount, transaction_type, description " +
                            "FROM transactions " +
                            "WHERE user_id = ? " +
                            "ORDER BY id DESC";

                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, requestedUserId);
                ResultSet rs = stmt.executeQuery();

                List<Map<String, Object>> transactions = new ArrayList<>();

                while (rs.next()) {
                    Map<String, Object> transaction = new HashMap<>();
                    transaction.put("id", rs.getInt("id"));
                    transaction.put("user_id", rs.getInt("user_id"));
                    transaction.put("amount", rs.getDouble("amount"));
                    transaction.put("transaction_type", rs.getString("transaction_type"));
                    transaction.put("description", rs.getString("description"));
                    
                    transactions.add(transaction);
                }

                ctx.json(transactions);

            } catch (NumberFormatException e) {
                ctx.status(400).result("Invalid user ID format");
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });

        System.out.println("✅ Backend is ready!");
    }
}