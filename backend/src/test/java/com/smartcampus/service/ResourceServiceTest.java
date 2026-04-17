package com.smartcampus.service;

import com.smartcampus.dto.request.ResourceDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.service.impl.ResourceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceServiceImpl resourceService;

    private Resource sampleResource;
    private ResourceDTO sampleDTO;

    @BeforeEach
    void setUp() {
        sampleResource = Resource.builder()
                .id("1")
                .name("Lab A")
                .type(ResourceType.LAB)
                .capacity(30)
                .location("Block C")
                .availableFrom(LocalTime.of(8, 0))
                .availableTo(LocalTime.of(18, 0))
                .status(ResourceStatus.ACTIVE)
                .build();

        sampleDTO = ResourceDTO.builder()
                .name("Lab A")
                .type(ResourceType.LAB)
                .capacity(30)
                .location("Block C")
                .availableFrom(LocalTime.of(8, 0))
                .availableTo(LocalTime.of(18, 0))
                .status(ResourceStatus.ACTIVE)
                .build();
    }

    @Test
    void getResourceById_ReturnsResource_WhenExists() {
        when(resourceRepository.findById("1")).thenReturn(Optional.of(sampleResource));
        ResourceDTO result = resourceService.getResourceById("1");
        assertEquals("Lab A", result.getName());
        assertEquals(ResourceType.LAB, result.getType());
    }

    @Test
    void getResourceById_ThrowsException_WhenNotFound() {
        when(resourceRepository.findById("99")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> resourceService.getResourceById("99"));
    }

    @Test
    void createResource_ReturnsCreatedResource() {
        when(resourceRepository.save(any(Resource.class))).thenReturn(sampleResource);
        ResourceDTO result = resourceService.createResource(sampleDTO);
        assertEquals("Lab A", result.getName());
        verify(resourceRepository, times(1)).save(any());
    }

    @Test
    void deleteResource_ThrowsException_WhenNotFound() {
        when(resourceRepository.existsById("99")).thenReturn(false);
        assertThrows(ResourceNotFoundException.class, () -> resourceService.deleteResource("99"));
    }
}

