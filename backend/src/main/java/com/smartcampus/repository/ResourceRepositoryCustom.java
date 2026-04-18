package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;

import java.util.List;

public interface ResourceRepositoryCustom {
    List<Resource> searchResources(
            ResourceType type,
            String location,
            ResourceStatus status,
            Integer minCapacity
    );
}
