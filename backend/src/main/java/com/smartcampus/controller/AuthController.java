package com.smartcampus.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final com.smartcampus.service.AuthService authService;
    
    public AuthController(com.smartcampus.service.AuthService authService) {
        this.authService = authService;
    }

    @org.springframework.web.bind.annotation.PostMapping("/login")
    public org.springframework.http.ResponseEntity<com.smartcampus.dto.response.AuthResponse> login(@org.springframework.web.bind.annotation.RequestBody com.smartcampus.dto.request.LoginRequest request) {
        return org.springframework.http.ResponseEntity.ok(authService.login(request));
    }

    @org.springframework.web.bind.annotation.PostMapping("/register")
    public org.springframework.http.ResponseEntity<com.smartcampus.dto.response.AuthResponse> register(@org.springframework.web.bind.annotation.RequestBody com.smartcampus.dto.request.RegisterRequest request) {
        return org.springframework.http.ResponseEntity.ok(authService.register(request));
    }
}
