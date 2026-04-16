package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.smartcampus.model.enums.FacilityStatus;
import com.smartcampus.model.enums.FacilityType;

@Document(collection = "facilities")
public class Facility {
    @Id
    private String id;
    private String name;
    private String location;
    private FacilityStatus status;
    private Integer capacity;
    private FacilityType type;

    public Facility() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public FacilityStatus getStatus() { return status; }
    public void setStatus(FacilityStatus status) { this.status = status; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public FacilityType getType() { return type; }
    public void setType(FacilityType type) { this.type = type; }
}
