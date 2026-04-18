package com.smartcampus.service;

import com.smartcampus.dto.DTOs.FacilityRequest;
import com.smartcampus.model.Facility;
import com.smartcampus.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final FacilityRepository facilityRepository;

    public Facility createFacility(FacilityRequest request) {
        Facility facility = Facility.builder()
                .name(request.getName())
                .description(request.getDescription())
                .location(request.getLocation())
                .building(request.getBuilding())
                .floor(request.getFloor())
                .capacity(request.getCapacity())
                .type(Facility.FacilityType.valueOf(request.getType()))
                .amenities(request.getAmenities())
                .imageUrls(request.getImageUrls())
                .contactPerson(request.getContactPerson())
                .contactEmail(request.getContactEmail())
                .operatingHours(request.getOperatingHours())
                .available(true)
                .build();
        return facilityRepository.save(facility);
    }

    public List<Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }

    public List<Facility> getAvailableFacilities() {
        return facilityRepository.findByAvailableTrue();
    }

    public Facility getFacilityById(String id) {
        return facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found"));
    }

    public List<Facility> searchFacilities(String name) {
        return facilityRepository.findByNameContainingIgnoreCase(name);
    }

    public Facility updateFacility(String id, FacilityRequest request) {
        Facility facility = getFacilityById(id);

        if (request.getName() != null) facility.setName(request.getName());
        if (request.getDescription() != null) facility.setDescription(request.getDescription());
        if (request.getLocation() != null) facility.setLocation(request.getLocation());
        if (request.getBuilding() != null) facility.setBuilding(request.getBuilding());
        facility.setFloor(request.getFloor());
        facility.setCapacity(request.getCapacity());
        if (request.getType() != null) facility.setType(Facility.FacilityType.valueOf(request.getType()));
        if (request.getAmenities() != null) facility.setAmenities(request.getAmenities());
        if (request.getImageUrls() != null) facility.setImageUrls(request.getImageUrls());
        if (request.getContactPerson() != null) facility.setContactPerson(request.getContactPerson());
        if (request.getContactEmail() != null) facility.setContactEmail(request.getContactEmail());
        if (request.getOperatingHours() != null) facility.setOperatingHours(request.getOperatingHours());
        facility.setAvailable(request.isAvailable());
        facility.setUpdatedAt(LocalDateTime.now());

        return facilityRepository.save(facility);
    }

    public void deleteFacility(String id) {
        if (!facilityRepository.existsById(id)) {
            throw new RuntimeException("Facility not found");
        }
        facilityRepository.deleteById(id);
    }
}
