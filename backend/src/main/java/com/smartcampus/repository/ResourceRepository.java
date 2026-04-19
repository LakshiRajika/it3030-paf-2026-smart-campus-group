package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String>, ResourceRepositoryCustom {
    List<Resource> findByType(ResourceType type);
    List<Resource> findByLocation(String location);
    List<Resource> findByStatus(ResourceStatus status);
}

