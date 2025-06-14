package com.yourapp;

import java.io.InputStream;
import java.util.Properties;

import javax.mail.Authenticator;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

public class EmailService {
    
    private static final Properties config = loadProperties();
    
    // Load configuration from properties file
    private static Properties loadProperties() {
        Properties props = new Properties();
        try (InputStream input = EmailService.class.getClassLoader().getResourceAsStream("application.properties")) {
            if (input != null) {
                props.load(input);
            } else {
                System.err.println("⚠️ application.properties not found, using environment variables");
            }
        } catch (Exception e) {
            System.err.println("❌ Error loading properties: " + e.getMessage());
        }
        return props;
    }
    
    // Get configuration with fallback to environment variables
    private static String getConfig(String key, String envVar) {
        String value = config.getProperty(key);
        if (value != null && !value.trim().isEmpty()) {
            // Fix: if value is "${...}" → treat as empty and fallback to env
            if (value.startsWith("${") && value.endsWith("}")) {
                System.out.println("🔄 Falling back to ENV for " + key + " → using " + envVar);
                return System.getenv(envVar);
            }
            return value;
        }
        return System.getenv(envVar);
    }

    
    // Configuration getters
    private static final String SMTP_HOST = getConfig("email.smtp.host", "SMTP_HOST");
    private static final String SMTP_PORT = getConfig("email.smtp.port", "SMTP_PORT");
    private static final String EMAIL_USERNAME = getConfig("email.username", "EMAIL_USERNAME");
    private static final String EMAIL_PASSWORD = getConfig("email.password", "EMAIL_PASSWORD");
    private static final String FRONTEND_URL = getConfig("app.frontend.url", "FRONTEND_URL");
    
    // Replace your sendPasswordResetEmail method with this fixed version:

    public static void sendPasswordResetEmail(String toEmail, String resetToken) {
        // Debug: Print configuration values
        System.out.println("🔧 Email Debug Info:");
        System.out.println("   SMTP_HOST: " + (SMTP_HOST != null ? SMTP_HOST : "NULL"));
        System.out.println("   SMTP_PORT: " + (SMTP_PORT != null ? SMTP_PORT : "NULL"));
        System.out.println("   EMAIL_USERNAME: " + (EMAIL_USERNAME != null ? EMAIL_USERNAME : "NULL"));
        System.out.println("   EMAIL_PASSWORD: " + (EMAIL_PASSWORD != null ? "***SET***" : "NULL"));
        System.out.println("   FRONTEND_URL: " + (FRONTEND_URL != null ? FRONTEND_URL : "NULL"));
        
        try {
            // Enhanced SMTP properties with SSL/TLS fixes
            Properties props = new Properties();
            props.put("mail.smtp.host", SMTP_HOST != null ? SMTP_HOST : "smtp.gmail.com");
            props.put("mail.smtp.port", SMTP_PORT != null ? SMTP_PORT : "587");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            
            // Add these SSL/TLS protocol fixes
            props.put("mail.smtp.ssl.protocols", "TLSv1.2");
            props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
            props.put("mail.smtp.ssl.checkserveridentity", "true");
            
            System.out.println("📧 Attempting to send email to: " + toEmail);
            
            // Create session
            Session session = Session.getInstance(props, new Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(EMAIL_USERNAME, EMAIL_PASSWORD);
                }
            });
            
            // Create message
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(EMAIL_USERNAME));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail));
            message.setSubject("Resetovanje šifre - Tenis Coach Tarik");
            
            // Reset URL
            String baseUrl = FRONTEND_URL != null ? FRONTEND_URL : "https://tariktenis.com";
            String resetUrl = baseUrl + "/reset-password?token=" + resetToken;
            
            // HTML email content
            String htmlContent = "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                    "<meta charset=\"UTF-8\">" +
                    "<title>Resetovanje šifre</title>" +
                    "<style>" +
                        "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                        ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                        ".header { background-color: #478ac9; color: white; padding: 20px; text-align: center; }" +
                        ".content { background-color: #f9f9f9; padding: 30px; }" +
                        ".button { display: inline-block; background-color: #478ac9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }" +
                        ".footer { background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }" +
                        ".warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }" +
                    "</style>" +
                "</head>" +
                "<body>" +
                    "<div class=\"container\">" +
                        "<div class=\"header\">" +
                            "<h1>🎾 Tenis Coach Tarik</h1>" +
                            "<h2>Resetovanje šifre</h2>" +
                        "</div>" +
                        
                        "<div class=\"content\">" +
                            "<p>Pozdrav!</p>" +
                            
                            "<p>Primili smo zahtev za resetovanje vaše šifre. Kliknite na dugme ispod da biste kreirali novu šifru:</p>" +
                            
                            "<div style=\"text-align: center;\">" +
                                "<a href=\"" + resetUrl + "\" class=\"button\">🔑 Resetuj šifru</a>" +
                            "</div>" +
                            
                            "<p>Alternativno, možete kopirati i zalepiti sledeći link u vaš browser:</p>" +
                            "<p style=\"word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 3px;\">" +
                                resetUrl +
                            "</p>" +
                            
                            "<div class=\"warning\">" +
                                "<strong>⚠️ Važno:</strong>" +
                                "<ul>" +
                                    "<li>Ovaj link ističe za <strong>30 minuta</strong></li>" +
                                    "<li>Link može biti korišćen samo jednom</li>" +
                                    "<li>Ako niste zatražili resetovanje šifre, ignorirajte ovaj email</li>" +
                                "</ul>" +
                            "</div>" +
                            
                            "<p>Ako imate problema sa linkovima, kontaktirajte nas na:</p>" +
                            "<p>📞 +387 63 039 998<br>" +
                            "📧 " + EMAIL_USERNAME + "</p>" +
                        "</div>" +
                        
                        "<div class=\"footer\">" +
                            "<p>© 2024 Tenis Coach Tarik - Powered by @pekaricc</p>" +
                            "<p>Setalište Slana Banja, Tuzla, 75000</p>" +
                        "</div>" +
                    "</div>" +
                "</body>" +
                "</html>";
            
            message.setContent(htmlContent, "text/html; charset=utf-8");
            
            System.out.println("📤 Sending email...");
            
            // Send email
            Transport.send(message);
            
            System.out.println("✅ Password reset email sent to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to: " + toEmail);
            System.err.println("❌ Error type: " + e.getClass().getSimpleName());
            System.err.println("❌ Error message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send email", e);
        }
    }


    // Add this debugging version to your EmailService.sendPasswordResetEmail method
    // Replace the existing method with this enhanced version

    /*public static void sendPasswordResetEmail(String toEmail, String resetToken) {
        // Debug: Print configuration values
        System.out.println("🔧 Email Debug Info:");
        System.out.println("   SMTP_HOST: " + (SMTP_HOST != null ? SMTP_HOST : "NULL"));
        System.out.println("   SMTP_PORT: " + (SMTP_PORT != null ? SMTP_PORT : "NULL"));
        System.out.println("   EMAIL_USERNAME: " + (EMAIL_USERNAME != null ? EMAIL_USERNAME : "NULL"));
        System.out.println("   EMAIL_PASSWORD: " + (EMAIL_PASSWORD != null ? "***SET***" : "NULL"));
        System.out.println("   FRONTEND_URL: " + (FRONTEND_URL != null ? FRONTEND_URL : "NULL"));
        
        try {
            // SMTP properties
            Properties props = new Properties();
            props.put("mail.smtp.host", SMTP_HOST != null ? SMTP_HOST : "smtp.gmail.com");
            props.put("mail.smtp.port", SMTP_PORT != null ? SMTP_PORT : "587");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            
            System.out.println("📧 Attempting to send email to: " + toEmail);
            
            // Create session
            Session session = Session.getInstance(props, new Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(EMAIL_USERNAME, EMAIL_PASSWORD);
                }
            });
            
            // Enable debug mode for detailed SMTP logs
            session.setDebug(true);
            
            // Create message
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(EMAIL_USERNAME));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail));
            message.setSubject("Resetovanje šifre - Tenis Coach Tarik");
            
            // Reset URL
            String baseUrl = FRONTEND_URL != null ? FRONTEND_URL : "http://localhost:3000";
            String resetUrl = baseUrl + "/reset-password?token=" + resetToken;
            
            // Simple text content for testing
            String textContent = "Pozdrav!\n\n" +
                "Primili smo zahtev za resetovanje vaše šifre. " +
                "Kliknite na sledeći link da biste kreirali novu šifru:\n\n" +
                resetUrl + "\n\n" +
                "Ovaj link ističe za 30 minuta.\n\n" +
                "Tenis Coach Tarik";
            
            message.setText(textContent);
            
            System.out.println("📤 Sending email...");
            
            // Send email
            Transport.send(message);
            
            System.out.println("✅ Password reset email sent to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to: " + toEmail);
            System.err.println("❌ Error type: " + e.getClass().getSimpleName());
            System.err.println("❌ Error message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send email", e);
        }
    }*/
    
    // Also update your sendWelcomeEmail method with the same SSL fixes:

    public static void sendWelcomeEmail(String toEmail, String firstName, String lastName) {
        try {
            // Enhanced SMTP properties with SSL/TLS fixes
            Properties props = new Properties();
            props.put("mail.smtp.host", SMTP_HOST != null ? SMTP_HOST : "smtp.gmail.com");
            props.put("mail.smtp.port", SMTP_PORT != null ? SMTP_PORT : "587");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            
            // Add these SSL/TLS protocol fixes
            props.put("mail.smtp.ssl.protocols", "TLSv1.2");
            props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
            props.put("mail.smtp.ssl.checkserveridentity", "true");
            
            Session session = Session.getInstance(props, new Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(EMAIL_USERNAME, EMAIL_PASSWORD);
                }
            });
            
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(EMAIL_USERNAME));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail));
            message.setSubject("Dobrodošli - Tenis Coach Tarik");
            
            // HTML email content
            String baseUrl = FRONTEND_URL != null ? FRONTEND_URL : "http://localhost:3000";
            String htmlContent = "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                    "<meta charset=\"UTF-8\">" +
                    "<title>Dobrodošli</title>" +
                    "<style>" +
                        "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                        ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                        ".header { background-color: #27ae60; color: white; padding: 20px; text-align: center; }" +
                        ".content { background-color: #f9f9f9; padding: 30px; }" +
                        ".button { display: inline-block; background-color: #478ac9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }" +
                        ".footer { background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }" +
                    "</style>" +
                "</head>" +
                "<body>" +
                    "<div class=\"container\">" +
                        "<div class=\"header\">" +
                            "<h1>🎾 Dobrodošli!</h1>" +
                            "<h2>Tenis Coach Tarik</h2>" +
                        "</div>" +
                        
                        "<div class=\"content\">" +
                            "<p>Pozdrav " + firstName + "!</p>" +
                            
                            "<p>Dobrodošli u našu tenisku zajednicu! Vaš nalog je uspešno kreiran i spremni ste da počnete sa rezervisanjem termina.</p>" +
                            
                            "<div style=\"text-align: center;\">" +
                                "<a href=\"" + baseUrl + "/login\" class=\"button\">🏁 Prijavite se</a>" +
                            "</div>" +
                            
                            "<h3>Šta možete raditi:</h3>" +
                            "<ul>" +
                                "<li>🎯 Rezervišite termine za treninge</li>" +
                                "<li>📅 Upravljajte vašim rezervacijama</li>" +
                                "<li>👤 Ažurirajte vaš profil</li>" +
                                "<li>💰 Pratite vaš balans</li>" +
                            "</ul>" +
                            
                            "<p>Za bilo kakva pitanja, kontaktirajte nas:</p>" +
                            "<p>📞 +387 63 039 998<br>" +
                            "📧 " + EMAIL_USERNAME + "</p>" +
                        "</div>" +
                        
                        "<div class=\"footer\">" +
                            "<p>© 2024 Tenis Coach Tarik - Powered by @pekaricc</p>" +
                            "<p>Setalište Slana Banja, Tuzla, 75000</p>" +
                        "</div>" +
                    "</div>" +
                "</body>" +
                "</html>";
            
            message.setContent(htmlContent, "text/html; charset=utf-8");
            Transport.send(message);
            
            System.out.println("✅ Welcome email sent to: " + toEmail);
            
        } catch (MessagingException e) {
            System.err.println("❌ Failed to send welcome email to: " + toEmail);
            e.printStackTrace();
        }
    }

    
}