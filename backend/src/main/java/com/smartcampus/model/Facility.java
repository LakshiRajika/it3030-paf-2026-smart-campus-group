package com.smartcampus.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "facilities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Facility {
    @Id
    private String id;

    private String name;
    private String description;
    private String location;
    private String building;
    private int floor;
    private int capacity;
    private FacilityType type;
    private List<String> amenities;
    private List<String> imageUrls;

    @Builder.Default
    private boolean available = true;

    private String contactPerson;
    private String contactEmail;
    private String operatingHours;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    public enum FacilityType {
        LECTURE_HALL, LAB, MEETING_ROOM, AUDITORIUM, SPORTS_FACILITY, LIBRARY, STUDY_ROOM, OTHER
    }
}
