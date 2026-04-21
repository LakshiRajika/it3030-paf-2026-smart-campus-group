package com.smartcampus.dto.response;

import java.util.Set;

public class RoleResponse {
    private Long userId;
    private String userName;
    private String email;
    private Set<String> roles;

    public RoleResponse() {
    }

    public RoleResponse(Long userId, String userName, String email, Set<String> roles) {
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.roles = roles;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getEmail() {
        return email;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}
