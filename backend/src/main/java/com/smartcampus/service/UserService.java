package com.smartcampus.service;

import com.smartcampus.model.User;
import java.util.List;

public interface UserService {
    List<User> getTechnicians();
    User getUserById(String id);
    List<User> getAllUsers();
    User updateRoles(String id, java.util.Set<com.smartcampus.model.enums.UserRole> roles);
    void deleteUser(String id);
    User toggleUserStatus(String id);
}
