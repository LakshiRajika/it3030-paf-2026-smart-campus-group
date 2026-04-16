package com.smartcampus.repository;

import com.smartcampus.model.Facility;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacilityRepository extends MongoRepository<Facility, String> {
}
