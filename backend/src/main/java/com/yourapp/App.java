package com.yourapp;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.yourapp.Dto.JWTTokenDto;
import com.yourapp.Dto.LoginDto;
import com.yourapp.Security.JWTTokenProvider;
import com.yourapp.Security.PasswordSecurity;

import io.javalin.Javalin;

public class App {

    public static void migrateExistingPasswords() {
        try (Connection conn = Db.getConnection()) {
            // Get all users with their current passwords
            String selectSql = "SELECT id, email, password FROM users";
            String updateSql = "UPDATE users SET password = ? WHERE id = ?";
            
            try (PreparedStatement selectStmt = conn.prepareStatement(selectSql);
                PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                
                ResultSet rs = selectStmt.executeQuery();
                int migratedCount = 0;
                
                while (rs.next()) {
                    int userId = rs.getInt("id");
                    String email = rs.getString("email");
                    String currentPassword = rs.getString("password");
                    
                    // Check if password is already hashed (hashed passwords are much longer)
                    if (currentPassword.length() < 50) {
                        // Assume it's plain text, hash it
                        String hashedPassword = PasswordSecurity.hashPassword(currentPassword);
                        
                        updateStmt.setString(1, hashedPassword);
                        updateStmt.setInt(2, userId);
                        updateStmt.executeUpdate();
                        
                        migratedCount++;
                        System.out.println("✅ Migrated password for user: " + email);
                    } else {
                        System.out.println("⏭️ Password already hashed for user: " + email);
                    }
                }
                
                System.out.println("🎉 Migration complete! Migrated " + migratedCount + " passwords.");
            }
        } catch (Exception e) {
            System.err.println("❌ Error during password migration: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {

        System.out.println("🚀 Starting Backend...");

        // Run password migration ONCE (comment out after first run)
        System.out.println("🔄 Starting password migration...");
        migrateExistingPasswords();

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
        app.get("/", ctx -> ctx.result("Pozdrav od @pekaricc!"));

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

                    if (PasswordSecurity.verifyPassword(loginDto.getPassword(), storedPassword)) {
                        String token = tokenProvider.generateToken(loginDto.getEmail(), role);
                        ctx.json(new JWTTokenDto(token));
                    } else {
                        ctx.status(401).result("Nevažeća lozinka");
                    }
                } else {
                    ctx.status(401).result("Korisnik nije pronađen");
                }

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });

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

                ctx.result("Time Slot uspješno dodan");

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
                    ctx.status(500).result("Korisnik nije pronađen");
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
                    ctx.result("Time Slot je uspješno rezerviran");
                } else {
                    ctx.status(400).result("Time Slot je već rezerviran ili ne postoji");
                }

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });

        // POST Unbook time slot (User unbooks their own slot)
        app.post("/api/time-slots/unbook/{id}", ctx -> {
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
                    ctx.status(500).result("Korisnik nije pronađen");
                    return;
                }

                int userId = userRs.getInt("id");

                // Check if the slot is booked by this user
                String checkSql = "SELECT booked_by FROM time_slots WHERE id = ? AND is_booked = true";
                PreparedStatement checkStmt = conn.prepareStatement(checkSql);
                checkStmt.setInt(1, slotId);
                ResultSet checkRs = checkStmt.executeQuery();

                if (!checkRs.next()) {
                    ctx.status(400).result("Time Slot nije rezerviran ili ne postoji");
                    return;
                }

                int bookedBy = checkRs.getInt("booked_by");
                if (bookedBy != userId) {
                    ctx.status(403).result("Možete otkazati samo svoje rezervacije.");
                    return;
                }

                // Unbook the slot
                String updateSql = "UPDATE time_slots SET is_booked = false, booked_by = NULL WHERE id = ?";
                PreparedStatement updateStmt = conn.prepareStatement(updateSql);
                updateStmt.setInt(1, slotId);
                int updatedRows = updateStmt.executeUpdate();

                if (updatedRows > 0) {
                    ctx.result("Time Slot uspješno otkazan");
                } else {
                    ctx.status(500).result("Neuspjeh u otkazivanju time slot-a");
                }

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });

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
                    ctx.status(404).result("Time slot nije pronađen");
                    return;
                }

                boolean isBooked = checkRs.getBoolean("is_booked");

                // Delete the time slot
                String deleteSql = "DELETE FROM time_slots WHERE id = ?";
                PreparedStatement deleteStmt = conn.prepareStatement(deleteSql);
                deleteStmt.setInt(1, slotId);
                int deletedRows = deleteStmt.executeUpdate();

                if (deletedRows > 0) {
                    ctx.result("Time Slot uspješno obrisan");
                } else {
                    ctx.status(404).result("Time Slot nije pronađen");
                }

            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });

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
                    ctx.status(404).result("Korisnik nije pronađen");
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
                    ctx.status(400).result("Nedostaju potrebna polja");
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
                        ctx.status(400).result("Korisnik sa ovim email već postoji");
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
                    ctx.result("Uspješno ažuriran račun");
                } else {
                    ctx.status(404).result("Korisnik ne postoji");
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
                    ctx.status(400).result("Nedostaju potrebna polja");
                    return;
                }

                // Validate role
                if (!"USER".equals(role) && !"ADMIN".equals(role)) {
                    ctx.status(400).result("Nevažeća uloga. Mora biti USER ili ADMIN");
                    return;
                }

                // Parse balance
                double balance = 0.0;
                if (balanceObj != null) {
                    try {
                        balance = Double.parseDouble(balanceObj.toString());
                    } catch (NumberFormatException e) {
                        ctx.status(400).result("Nevažeći format balance-a");
                        return;
                    }
                }

                // Check if email already exists
                String checkEmailSql = "SELECT id FROM users WHERE email = ?";
                PreparedStatement checkStmt = conn.prepareStatement(checkEmailSql);
                checkStmt.setString(1, email.toLowerCase());
                ResultSet checkRs = checkStmt.executeQuery();

                if (checkRs.next()) {
                    ctx.status(400).result("Email već postoji");
                    return;
                }

                String hashedPassword = PasswordSecurity.hashPassword(password);

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
                    ctx.result("Korisnik je uspješno registriran");
                    
                    // Send welcome email with error handling
                    try {
                        EmailService.sendWelcomeEmail(email, firstName, lastName);
                        System.out.println("✅ Email dobrodošlice poslat na: " + email);
                    } catch (Exception emailError) {
                        System.err.println("❌ Email dobrodošlice nije poslat na" + email + ": " + emailError.getMessage());
                        // Don't fail the registration if email fails - user is already created
                    }
                } else {
                    ctx.status(500).result("Registracija korisnika nije uspjela");
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
                    ctx.status(400).result("Nedostaju potrebna polja");
                    return;
                }

                int userId;
                try {
                    userId = Integer.parseInt(userIdObj.toString());
                } catch (NumberFormatException e) {
                    ctx.status(400).result("Nevažeći format korisničkog ID-a");
                    return;
                }

                // Validate password length
                if (newPassword.length() < 6) {
                    ctx.status(400).result("Lozinka mora imati najmanje 6 znakova");
                    return;
                }

                // Check if user exists
                String checkUserSql = "SELECT id FROM users WHERE id = ?";
                PreparedStatement checkStmt = conn.prepareStatement(checkUserSql);
                checkStmt.setInt(1, userId);
                ResultSet checkRs = checkStmt.executeQuery();

                if (!checkRs.next()) {
                    ctx.status(404).result("Korisnik nije pronađen");
                    return;
                }

                String hashedPassword = PasswordSecurity.hashPassword(newPassword);

                // Update user password
                String updateSql = "UPDATE users SET password = ? WHERE id = ?";
                PreparedStatement updateStmt = conn.prepareStatement(updateSql);
                updateStmt.setString(1, hashedPassword);
                updateStmt.setInt(2, userId);
                
                int updatedRows = updateStmt.executeUpdate();

                if (updatedRows > 0) {
                    ctx.result("Resetiranje lozinke uspješno");
                } else {
                    ctx.status(500).result("Nije uspjelo resetiranje lozinke");
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
                    ctx.status(400).result("Nedostaju potrebna polja");
                    return;
                }

                // Parse values
                int userId;
                double amount;
                try {
                    userId = Integer.parseInt(userIdObj.toString());
                    amount = Double.parseDouble(amountObj.toString());
                } catch (NumberFormatException e) {
                    ctx.status(400).result("Neispravan format broja");
                    return;
                }

                // Validate transaction type
                if (!"ADD".equals(transactionType) && !"SUBTRACT".equals(transactionType)) {
                    ctx.status(400).result("Neispravna vrsta transakcije. Mora biti ADD ili SUBTRACT");
                    return;
                }

                // Validate amount
                if (amount <= 0) {
                    ctx.status(400).result("Iznos mora biti pozitivan");
                    return;
                }

                // Get current user balance
                String balanceSql = "SELECT balance FROM users WHERE id = ?";
                PreparedStatement balanceStmt = conn.prepareStatement(balanceSql);
                balanceStmt.setInt(1, userId);
                ResultSet balanceRs = balanceStmt.executeQuery();

                if (!balanceRs.next()) {
                    ctx.status(404).result("Korisnik nije pronađen");
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
                    ctx.result("Transakcija je uspješno obrađena");

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
                    ctx.status(404).result("Korisnik nije pronađen");
                    return;
                }

                int currentUserId = userCheckRs.getInt("id");
                String currentUserRole = userCheckRs.getString("role");

                // Only allow if admin or user requesting their own transactions
                if (!"ADMIN".equals(currentUserRole) && currentUserId != requestedUserId) {
                    ctx.status(403).result("Zabranjeno: Možete pregledavati samo svoje transakcije");
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
                ctx.status(400).result("Nevažeći format korisničkog ID-a");
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });

        // POST /api/auth/forgot-password
        app.post("/api/auth/forgot-password", ctx -> {
            Map<String, Object> body = ctx.bodyAsClass(Map.class);
            String email = (String) body.get("email");
            
            if (email == null || email.trim().isEmpty()) {
                ctx.status(400).result("Email je obavezan");
                return;
            }
            
            try (Connection conn = Db.getConnection()) {
                // Check if user exists
                String checkSql = "SELECT id FROM users WHERE email = ?";
                PreparedStatement checkStmt = conn.prepareStatement(checkSql);
                checkStmt.setString(1, email.toLowerCase());
                ResultSet rs = checkStmt.executeQuery();
                
                if (rs.next()) {
                    int userId = rs.getInt("id");
                    
                    // Generate secure token
                    String token = UUID.randomUUID().toString().replace("-", "") + 
                                UUID.randomUUID().toString().replace("-", "");
                    
                    // Set expiration (30 minutes from now)
                    Timestamp expiresAt = new Timestamp(System.currentTimeMillis() + 30 * 60 * 1000);
                    
                    // Delete any existing tokens for this user
                    String deleteSql = "DELETE FROM password_reset_tokens WHERE user_id = ?";
                    PreparedStatement deleteStmt = conn.prepareStatement(deleteSql);
                    deleteStmt.setInt(1, userId);
                    deleteStmt.executeUpdate();
                    
                    // Insert new token
                    String insertSql = "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)";
                    PreparedStatement insertStmt = conn.prepareStatement(insertSql);
                    insertStmt.setInt(1, userId);
                    insertStmt.setString(2, token);
                    insertStmt.setTimestamp(3, expiresAt);
                    insertStmt.executeUpdate();
                    
                    // Send email (with fallback for testing)
                    try {
                        EmailService.sendPasswordResetEmail(email, token);
                    } catch (Exception emailError) {
                        System.err.println("Slanje e-pošte nije uspjelo, ali token je stvoren: " + emailError.getMessage());
                        // For testing - print token to console
                        System.out.println("🔑 Resetiranje tokena za " + email + ": " + token);
                        System.out.println("🔗 Reset URL: https://tariktenis.com/reset-password?token=" + token);
                    }
                }
                
                // Always return success message (security measure)
                ctx.result("Ako ova email adresa postoji, dobit ćete link za resetovanje šifre.");
                
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });

        // POST /api/auth/reset-password
        app.post("/api/auth/reset-password", ctx -> {
            Map<String, Object> body = ctx.bodyAsClass(Map.class);
            String token = (String) body.get("token");
            String newPassword = (String) body.get("newPassword");
            
            if (token == null || newPassword == null) {
                ctx.status(400).result("Token i nova lozinka su potrebni");
                return;
            }
            
            if (newPassword.length() < 6) {
                ctx.status(400).result("Lozinka mora imati najmanje 6 znakova");
                return;
            }
            
            try (Connection conn = Db.getConnection()) {
                // Find valid token
                String tokenSql = "SELECT user_id FROM password_reset_tokens WHERE token = ? AND expires_at > NOW() AND used = FALSE";
                PreparedStatement tokenStmt = conn.prepareStatement(tokenSql);
                tokenStmt.setString(1, token);
                ResultSet tokenRs = tokenStmt.executeQuery();
                
                if (tokenRs.next()) {
                    int userId = tokenRs.getInt("user_id");
                    
                    // Start transaction
                    conn.setAutoCommit(false);
                    
                    try {
                        // Update password
                        String updatePasswordSql = "UPDATE users SET password = ? WHERE id = ?";
                        PreparedStatement updatePasswordStmt = conn.prepareStatement(updatePasswordSql);
                        updatePasswordStmt.setString(1, PasswordSecurity.hashPassword(newPassword)); // In production, hash this!
                        updatePasswordStmt.setInt(2, userId);
                        updatePasswordStmt.executeUpdate();
                        
                        // Mark token as used
                        String markUsedSql = "UPDATE password_reset_tokens SET used = TRUE WHERE token = ?";
                        PreparedStatement markUsedStmt = conn.prepareStatement(markUsedSql);
                        markUsedStmt.setString(1, token);
                        markUsedStmt.executeUpdate();
                        
                        // Commit transaction
                        conn.commit();
                        
                        ctx.result("Šifra je uspješno promjenjena!");
                        
                    } catch (Exception e) {
                        conn.rollback();
                        throw e;
                    } finally {
                        conn.setAutoCommit(true);
                    }
                    
                } else {
                    ctx.status(400).result("Nevažeći ili istekli token za resetovanje šifre");
                }
                
            } catch (Exception e) {
                e.printStackTrace();
                ctx.status(500).result("Server error: " + e.getMessage());
            }
        });

        System.out.println("✅ Backend is ready!");
    }
}