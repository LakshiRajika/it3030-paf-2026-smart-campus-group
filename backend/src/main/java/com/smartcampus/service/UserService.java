package com.smartcampus.service;

import com.smartcampus.dto.DTOs.*;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role);
    }

    public User updateUser(String id, UpdateUserRequest request) {
        User user = getUserById(id);

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getStudentId() != null) user.setStudentId(request.getStudentId());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getFaculty() != null) user.setFaculty(request.getFaculty());
        if (request.getProfileImageUrl() != null) user.setProfileImageUrl(request.getProfileImageUrl());

        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User updateUserRole(String id, String role) {
        User user = getUserById(id);
        user.setRole(User.Role.valueOf(role.toUpperCase()));
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User toggleUserActive(String id) {
        User user = getUserById(id);
        user.setActive(!user.isActive());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    public long getTotalUsers() {
        return userRepository.count();
    }
}
