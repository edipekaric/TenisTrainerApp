package com.yourapp.Dto;

public class JWTTokenDto {
    private String token;

    public JWTTokenDto(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }
}
