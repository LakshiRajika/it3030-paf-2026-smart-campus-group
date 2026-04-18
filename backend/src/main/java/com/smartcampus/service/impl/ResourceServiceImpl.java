package com.smartcampus.service.impl;

import com.smartcampus.dto.request.ResourceDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    @Override
    public List<ResourceDTO> getAllResources() {
        return resourceRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public ResourceDTO getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return toDTO(resource);
    }

    @Override
    public ResourceDTO createResource(ResourceDTO dto) {
        Resource resource = toEntity(dto);
        Resource saved = resourceRepository.save(resource);
        return toDTO(saved);
    }

    @Override
    public ResourceDTO updateResource(String id, ResourceDTO dto) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        existing.setName(dto.getName());
        existing.setType(dto.getType());
        existing.setCapacity(dto.getCapacity());
        existing.setLocation(dto.getLocation());
        existing.setAvailableFrom(dto.getAvailableFrom());
        existing.setAvailableTo(dto.getAvailableTo());
        existing.setStatus(dto.getStatus());

        return toDTO(resourceRepository.save(existing));
    }

    @Override
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    @Override
    public List<ResourceDTO> searchResources(ResourceType type, String location, ResourceStatus status, Integer minCapacity) {
        return resourceRepository.searchResources(type, location, status, minCapacity)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    private ResourceDTO toDTO(Resource r) {
        return ResourceDTO.builder()
                .id(r.getId())
                .name(r.getName())
                .type(r.getType())
                .capacity(r.getCapacity())
                .location(r.getLocation())
                .availableFrom(r.getAvailableFrom())
                .availableTo(r.getAvailableTo())
                .status(r.getStatus())
                .build();
    }

    private Resource toEntity(ResourceDTO dto) {
        return Resource.builder()
                .name(dto.getName())
                .type(dto.getType())
                .capacity(dto.getCapacity())
                .location(dto.getLocation())
                .availableFrom(dto.getAvailableFrom())
                .availableTo(dto.getAvailableTo())
                .status(dto.getStatus())
                .build();
    }
}

