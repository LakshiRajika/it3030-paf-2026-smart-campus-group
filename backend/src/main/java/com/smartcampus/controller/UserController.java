package com.smartcampus.controller;

import com.smartcampus.model.User;
import com.smartcampus.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<User>> getTechnicians() {
        return ResponseEntity.ok(userService.getTechnicians());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<User> updateRoles(@org.springframework.web.bind.annotation.PathVariable String id, @org.springframework.web.bind.annotation.RequestBody java.util.Set<com.smartcampus.model.enums.UserRole> roles) {
        return ResponseEntity.ok(userService.updateRoles(id, roles));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@org.springframework.web.bind.annotation.PathVariable String id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting user: " + e.getMessage());
        }
    }

    @org.springframework.web.bind.annotation.PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> toggleStatus(@org.springframework.web.bind.annotation.PathVariable String id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }
}
