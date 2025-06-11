// Create this test file to verify your email configuration
// File: src/main/java/com/yourapp/EmailTest.java

package com.yourapp;

public class EmailTest {
    public static void main(String[] args) {
        try {
            System.out.println("🧪 Testing email configuration...");
            
            // Test sending email to yourself
            String testEmail = "your-email@gmail.com"; // Replace with your email
            EmailService.sendWelcomeEmail(testEmail, "Test", "User");
            
            System.out.println("✅ Test completed - check your email!");
            
        } catch (Exception e) {
            System.err.println("❌ Email test failed:");
            e.printStackTrace();
        }
    }
}