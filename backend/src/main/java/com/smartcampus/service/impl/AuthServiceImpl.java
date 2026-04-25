package com.smartcampus.service.impl;

import com.smartcampus.dto.request.LoginRequest;
import com.smartcampus.dto.request.RegisterRequest;
import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.UserRole;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.CustomUserDetails;
import com.smartcampus.security.JwtTokenProvider;
import com.smartcampus.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @org.springframework.beans.factory.annotation.Value("${app.security.admin-emails}")
    private java.util.List<String> adminEmails;

    @org.springframework.beans.factory.annotation.Value("${app.security.technician-emails}")
    private java.util.List<String> technicianEmails;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getEmail()).orElseThrow();

        // Enforce whitelist check during login to instantly upgrade any existing user accounts
        java.util.Set<UserRole> synchronizedRoles = new java.util.HashSet<>();
        if (adminEmails.contains(user.getEmail())) {
            synchronizedRoles.add(UserRole.ADMIN);
        } else if (technicianEmails.contains(user.getEmail())) {
            synchronizedRoles.add(UserRole.TECHNICIAN);
        } else {
            synchronizedRoles.add(UserRole.USER);
        }
        
        // Only update DB if roles are mismatched
        if (!user.getRoles().containsAll(synchronizedRoles)) {
            user.setRoles(synchronizedRoles);
            user = userRepository.save(user);
        }

        String token = jwtTokenProvider.createToken(user);
        
        // Update last login
        user.setLastLogin(java.time.LocalDateTime.now());
        userRepository.save(user);

        return new AuthResponse(token);
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use");
        }

        java.util.Set<UserRole> roles = new java.util.HashSet<>();
        if (adminEmails.contains(request.getEmail())) {
            roles.add(UserRole.ADMIN);
        } else if (technicianEmails.contains(request.getEmail())) {
            roles.add(UserRole.TECHNICIAN);
        } else {
            roles.add(UserRole.USER);
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .roles(roles)
                .build();

        user = userRepository.save(user);
        String token = jwtTokenProvider.createToken(user);
        return new AuthResponse(token);
    }
}
