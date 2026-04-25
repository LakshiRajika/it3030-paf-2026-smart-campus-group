package com.smartcampus.model;

import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    private String name;
    private ResourceType type;

    // Nullable for non-room resources (e.g., equipment)
    private Integer capacity;

    private String location;

    // Daily availability window (optional; can be null to mean "no restriction")
    private LocalTime availableFrom;
    private LocalTime availableTo;

    private ResourceStatus status;

    private String imageUrl;
    private List<String> amenities;
    private List<WeeklySlot> weeklySlots;
}