package com.smartcampus.config;

import com.smartcampus.model.User;
import com.smartcampus.model.enums.UserRole;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin-account@gmail.com";
        java.util.Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);
        
        if (existingAdmin.isEmpty()) {
            Set<UserRole> roles = new HashSet<>();
            roles.add(UserRole.ADMIN);

            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("123456"))
                    .name("System Admin")
                    .roles(roles)
                    .build();

            userRepository.save(admin);
            System.out.println("Default admin account created: admin-account@gmail.com / 123456");
        } else {
            // Force reset password to ensure user can log in
            User admin = existingAdmin.get();
            admin.setPassword(passwordEncoder.encode("123456"));
            userRepository.save(admin);
            System.out.println("Admin account password reset to: 123456");
        }
    }
}
