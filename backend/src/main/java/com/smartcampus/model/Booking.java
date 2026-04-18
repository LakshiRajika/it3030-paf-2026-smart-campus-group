package com.smartcampus.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    @Id
    private String id;

    private String userId;
    private String userName;
    private String userEmail;
    private String facilityId;
    private String facilityName;

    private String purpose;
    private String description;
    private int expectedAttendees;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    private String adminRemarks;
    private String approvedBy;
    private LocalDateTime approvedAt;

    private String rejectionReason;

    private boolean recurring;
    private String recurrencePattern;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    public enum BookingStatus {
        PENDING, APPROVED, REJECTED, CANCELLED, COMPLETED
    }
}
