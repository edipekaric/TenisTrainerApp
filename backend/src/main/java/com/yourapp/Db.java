package com.yourapp;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import io.github.cdimascio.dotenv.Dotenv;

public class Db {
    private static final Dotenv dotenv = Dotenv.load();
    private static final String URL = "jdbc:mysql://localhost:3306/tenis_trainer_web?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String USER = dotenv.get("DB_USER");
    private static final String PASSWORD = dotenv.get("DB_PASS");

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
