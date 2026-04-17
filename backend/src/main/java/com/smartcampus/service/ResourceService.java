package com.smartcampus.service;

import com.smartcampus.dto.request.ResourceDTO;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;

import java.util.List;

public interface ResourceService {
    List<ResourceDTO> getAllResources();

    ResourceDTO getResourceById(String id);

    ResourceDTO createResource(ResourceDTO dto);

    ResourceDTO updateResource(String id, ResourceDTO dto);

    void deleteResource(String id);

    List<ResourceDTO> searchResources(ResourceType type, String location, ResourceStatus status, Integer minCapacity);
}

