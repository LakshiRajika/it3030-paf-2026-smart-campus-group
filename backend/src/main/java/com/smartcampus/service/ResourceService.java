package com.smartcampus.service;

import com.smartcampus.dto.request.ResourceDTO;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResourceService {
    List<ResourceDTO> getAllResources();

    ResourceDTO getResourceById(String id);

    ResourceDTO createResource(ResourceDTO dto);
    ResourceDTO createResource(ResourceDTO dto, MultipartFile imageFile);

    ResourceDTO updateResource(String id, ResourceDTO dto);
    ResourceDTO updateResource(String id, ResourceDTO dto, MultipartFile imageFile);

    void deleteResource(String id);

    List<ResourceDTO> searchResources(ResourceType type, String location, ResourceStatus status, Integer minCapacity);
}

