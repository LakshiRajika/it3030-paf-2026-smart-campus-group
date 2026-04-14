package com.smartcampus.dto.request;

public class RoleRequest {
    private Long userId;
    private String roleName;

    public RoleRequest() {
    }

    public RoleRequest(Long userId, String roleName) {
        this.userId = userId;
        this.roleName = roleName;
    }

    public Long getUserId() {
        return userId;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
}
