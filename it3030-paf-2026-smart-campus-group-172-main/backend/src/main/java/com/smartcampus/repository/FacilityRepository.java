package com.smartcampus.repository;

import com.smartcampus.model.Facility;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FacilityRepository extends MongoRepository<Facility, String> {
    List<Facility> findByAvailableTrue();
    List<Facility> findByType(Facility.FacilityType type);
    List<Facility> findByBuilding(String building);
    List<Facility> findByNameContainingIgnoreCase(String name);
}
