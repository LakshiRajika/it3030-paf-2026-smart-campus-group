package com.smartcampus.service.impl;

import com.smartcampus.model.User;
import com.smartcampus.model.enums.UserRole;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.UserService;
import com.smartcampus.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<User> getTechnicians() {
        return userRepository.findByRolesContaining(UserRole.TECHNICIAN);
    }

    @Override
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User updateRoles(String id, java.util.Set<UserRole> roles) {
        User user = getUserById(id);
        user.setRoles(roles);
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(String id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }
}
