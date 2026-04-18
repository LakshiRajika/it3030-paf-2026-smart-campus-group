package com.smartcampus.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "maintenance_tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceTicket {
    @Id
    private String id;

    private String title;
    private String description;
    private String category;
    private String location;
    private String building;
    private int floor;
    private String roomNumber;

    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    private String reportedBy;
    private String reporterName;
    private String reporterEmail;

    private String assignedTo;
    private String assignedToName;

    @Builder.Default
    private List<String> attachmentUrls = new ArrayList<>();

    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    private String resolutionNotes;
    private LocalDateTime resolvedAt;
    private LocalDateTime estimatedCompletion;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    public enum Priority {
        LOW, MEDIUM, HIGH, URGENT
    }

    public enum TicketStatus {
        OPEN, IN_PROGRESS, ON_HOLD, RESOLVED, CLOSED
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Comment {
        private String id;
        private String userId;
        private String userName;
        private String userRole;
        private String content;

        @Builder.Default
        private LocalDateTime createdAt = LocalDateTime.now();
    }
}
