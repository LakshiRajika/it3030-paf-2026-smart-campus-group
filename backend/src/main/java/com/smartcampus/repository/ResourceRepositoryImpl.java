package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class ResourceRepositoryImpl implements ResourceRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    public ResourceRepositoryImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public List<Resource> searchResources(ResourceType type, String location, ResourceStatus status, Integer minCapacity) {
        List<Criteria> filters = new ArrayList<>();

        if (type != null) {
            filters.add(Criteria.where("type").is(type));
        }

        if (location != null && !location.isBlank()) {
            Pattern p = Pattern.compile(".*" + Pattern.quote(location.trim()) + ".*", Pattern.CASE_INSENSITIVE);
            filters.add(Criteria.where("location").regex(p));
        }

        if (status != null) {
            filters.add(Criteria.where("status").is(status));
        }

        if (minCapacity != null) {
            filters.add(Criteria.where("capacity").gte(minCapacity));
        }

        Query q = new Query();
        if (!filters.isEmpty()) {
            q.addCriteria(new Criteria().andOperator(filters.toArray(new Criteria[0])));
        }

        return mongoTemplate.find(q, Resource.class);
    }
}

