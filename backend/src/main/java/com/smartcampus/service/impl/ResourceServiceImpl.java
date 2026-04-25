package com.smartcampus.service.impl;

import com.smartcampus.dto.request.ResourceDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.ValidationException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private static final String RESOURCE_UPLOAD_DIR = "uploads/resources/";
    private static final long MAX_IMAGE_BYTES = 5L * 1024L * 1024L; // 5MB
    private static final Set<String> ALLOWED_IMAGE_EXT = Set.of("jpg", "jpeg", "png", "webp", "gif");

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
    public ResourceDTO createResource(ResourceDTO dto, MultipartFile imageFile) {
        Resource resource = toEntity(dto);
        if (imageFile != null && !imageFile.isEmpty()) {
            resource.setImageUrl(storeImage(imageFile));
        }
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
        existing.setImageUrl(dto.getImageUrl());
        existing.setAmenities(dto.getAmenities());
        existing.setWeeklySlots(dto.getWeeklySlots());

        return toDTO(resourceRepository.save(existing));
    }

    @Override
    public ResourceDTO updateResource(String id, ResourceDTO dto, MultipartFile imageFile) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        existing.setName(dto.getName());
        existing.setType(dto.getType());
        existing.setCapacity(dto.getCapacity());
        existing.setLocation(dto.getLocation());
        existing.setAvailableFrom(dto.getAvailableFrom());
        existing.setAvailableTo(dto.getAvailableTo());
        existing.setStatus(dto.getStatus());
        existing.setAmenities(dto.getAmenities());
        existing.setWeeklySlots(dto.getWeeklySlots());
        if (imageFile != null && !imageFile.isEmpty()) {
            existing.setImageUrl(storeImage(imageFile));
        } else {
            existing.setImageUrl(dto.getImageUrl());
        }

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
                .imageUrl(r.getImageUrl())
                .amenities(r.getAmenities())
                .weeklySlots(r.getWeeklySlots())
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
                .imageUrl(dto.getImageUrl())
                .amenities(dto.getAmenities())
                .weeklySlots(dto.getWeeklySlots())
                .build();
    }

    private String storeImage(MultipartFile file) {
        try {
            validateImageFile(file);
            Path uploadPath = Paths.get(RESOURCE_UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String original = file.getOriginalFilename() == null ? "resource-image" : file.getOriginalFilename();
            String safeOriginal = StringUtils.cleanPath(original).replaceAll("\\s+", "_");
            if (safeOriginal.contains("..")) {
                throw new ValidationException("Invalid file name");
            }
            String ext = getExtensionLower(safeOriginal);
            String fileName = UUID.randomUUID() + (ext != null ? ("." + ext) : "") ;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return "/api/v1/resources/images/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store resource image", e);
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Image file is missing");
        }
        if (file.getSize() > MAX_IMAGE_BYTES) {
            throw new ValidationException("Image file is too large. Max size is 5MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new ValidationException("Only image uploads are allowed");
        }
        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String safeOriginal = StringUtils.cleanPath(original);
        String ext = getExtensionLower(safeOriginal);
        if (ext == null || !ALLOWED_IMAGE_EXT.contains(ext)) {
            throw new ValidationException("Unsupported image type. Allowed: jpg, jpeg, png, webp, gif");
        }
    }

    private String getExtensionLower(String name) {
        if (name == null) return null;
        int lastDot = name.lastIndexOf('.');
        if (lastDot < 0 || lastDot == name.length() - 1) return null;
        return name.substring(lastDot + 1).toLowerCase();
    }
}

