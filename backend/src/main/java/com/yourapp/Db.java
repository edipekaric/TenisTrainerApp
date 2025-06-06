package com.yourapp;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Db {

    private static final String DB_HOST = System.getenv("DB_HOST");
    private static final String DB_PORT = System.getenv("DB_PORT");
    private static final String DB_NAME = System.getenv("DB_NAME");
    private static final String DB_USER = System.getenv("DB_USER");
    private static final String DB_PASS = System.getenv("DB_PASS");

    private static final String URL = "jdbc:mysql://" + DB_HOST + ":" + DB_PORT + "/" + DB_NAME
            + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";

    public static Connection getConnection() throws SQLException {
        boolean connected = false;
        int retries = 5;
        SQLException lastException = null;

        while (!connected && retries > 0) {
            try {
                Connection connection = DriverManager.getConnection(URL, DB_USER, DB_PASS);
                System.out.println("✅ DB connection established!");
                return connection;
            } catch (SQLException e) {
                if (retries == 5) {
                    System.out.println("❌ Initial DB connection failed: " + e.getMessage());
                } else {
                    System.out.println("❌ DB connection retry failed: " + e.getMessage());
                }

                retries--;
                lastException = e;

                if (retries > 0) {
                    System.out.println("🔄 Retrying in 2 seconds... (" + retries + " retries left)");
                    try {
                        Thread.sleep(2000);
                    } catch (InterruptedException ie) {
                        // ignore
                    }
                } else {
                    System.out.println("❌ Could not connect to DB after retries.");
                }
            }
        }

        throw lastException; // If failed after retries, throw last exception
    }
}
