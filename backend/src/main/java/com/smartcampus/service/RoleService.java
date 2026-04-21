package com.smartcampus.service;

import com.smartcampus.dto.request.RoleRequest;
import com.smartcampus.dto.response.RoleResponse;

public interface RoleService {
    RoleResponse assignRole(RoleRequest request);
    RoleResponse removeRole(RoleRequest request);
    RoleResponse replaceRole(RoleRequest request);
    RoleResponse getUserRoles(Long userId);
}
