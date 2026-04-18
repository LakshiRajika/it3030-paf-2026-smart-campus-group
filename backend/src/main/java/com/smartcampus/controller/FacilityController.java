package com.smartcampus.controller;

import com.smartcampus.dto.DTOs.*;
import com.smartcampus.model.Facility;
import com.smartcampus.service.FacilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
public class FacilityController {

    private final FacilityService facilityService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Facility>>> getAllFacilities() {
        return ResponseEntity.ok(ApiResponse.success("Facilities fetched", facilityService.getAllFacilities()));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<Facility>>> getAvailableFacilities() {
        return ResponseEntity.ok(ApiResponse.success("Available facilities fetched", facilityService.getAvailableFacilities()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Facility>> getFacilityById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Facility fetched", facilityService.getFacilityById(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Facility>>> searchFacilities(@RequestParam String name) {
        return ResponseEntity.ok(ApiResponse.success("Search results", facilityService.searchFacilities(name)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Facility>> createFacility(@Valid @RequestBody FacilityRequest request) {
        Facility facility = facilityService.createFacility(request);
        return ResponseEntity.ok(ApiResponse.success("Facility created successfully", facility));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Facility>> updateFacility(
            @PathVariable String id,
            @Valid @RequestBody FacilityRequest request) {
        Facility facility = facilityService.updateFacility(id, request);
        return ResponseEntity.ok(ApiResponse.success("Facility updated successfully", facility));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFacility(@PathVariable String id) {
        facilityService.deleteFacility(id);
        return ResponseEntity.ok(ApiResponse.success("Facility deleted successfully", null));
    }
}
