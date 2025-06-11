package com.yourapp.Security;

// Add this new class for password security
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

public class PasswordSecurity {
    
    /**
     * Hashes a password with a random salt using SHA-256
     * @param password The plain text password
     * @return A string containing salt + hash (safe to store in database)
     */
    public static String hashPassword(String password) {
        try {
            // Generate random salt
            SecureRandom random = new SecureRandom();
            byte[] salt = new byte[16];
            random.nextBytes(salt);
            
            // Create hash with salt
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt);
            byte[] hashedPassword = md.digest(password.getBytes("UTF-8"));
            
            // Combine salt + hash and encode to Base64
            byte[] saltAndHash = new byte[salt.length + hashedPassword.length];
            System.arraycopy(salt, 0, saltAndHash, 0, salt.length);
            System.arraycopy(hashedPassword, 0, saltAndHash, salt.length, hashedPassword.length);
            
            return Base64.getEncoder().encodeToString(saltAndHash);
            
        } catch (Exception e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }
    
    /**
     * Verifies a password against a stored hash
     * @param password The plain text password to verify
     * @param storedHash The stored hash from database
     * @return true if password matches, false otherwise
     */
    public static boolean verifyPassword(String password, String storedHash) {
        try {
            // Decode the stored hash
            byte[] saltAndHash = Base64.getDecoder().decode(storedHash);
            
            // Extract salt (first 16 bytes)
            byte[] salt = new byte[16];
            System.arraycopy(saltAndHash, 0, salt, 0, 16);
            
            // Extract stored hash (remaining bytes)
            byte[] storedPasswordHash = new byte[saltAndHash.length - 16];
            System.arraycopy(saltAndHash, 16, storedPasswordHash, 0, storedPasswordHash.length);
            
            // Hash the provided password with the same salt
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt);
            byte[] providedPasswordHash = md.digest(password.getBytes("UTF-8"));
            
            // Compare hashes
            return MessageDigest.isEqual(providedPasswordHash, storedPasswordHash);
            
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Simple test method to verify the implementation works
     */
    public static void testPasswordHashing() {
        String password = "mySecretPassword123";
        
        // Hash the password
        String hashedPassword = hashPassword(password);
        System.out.println("Original: " + password);
        System.out.println("Hashed: " + hashedPassword);
        
        // Verify correct password
        boolean isValid = verifyPassword(password, hashedPassword);
        System.out.println("Verification (correct): " + isValid);
        
        // Verify wrong password
        boolean isInvalid = verifyPassword("wrongPassword", hashedPassword);
        System.out.println("Verification (wrong): " + isInvalid);
    }
}