package com.smartcampus.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class DTOs {

    // ==================== AUTH DTOs ====================
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoogleAuthRequest {
        @NotBlank(message = "Google token is required")
        private String token;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        @NotBlank(message = "First name is required")
        private String firstName;

        @NotBlank(message = "Last name is required")
        private String lastName;

        private String phone;
        private String studentId;
        private String department;
        private String faculty;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;
        private String id;
        private String email;
        private String firstName;
        private String lastName;
        private String profileImageUrl;
        private String role;
        private String message;
    }

    // ==================== USER DTOs ====================
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateUserRequest {
        private String firstName;
        private String lastName;
        private String phone;
        private String studentId;
        private String department;
        private String faculty;
        private String profileImageUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRoleRequest {
        @NotBlank(message = "Role is required")
        private String role;
    }

    // ==================== FACILITY DTOs ====================
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FacilityRequest {
        @NotBlank(message = "Name is required")
        private String name;

        private String description;

        @NotBlank(message = "Location is required")
        private String location;

        private String building;
        private int floor;

        @Min(value = 1, message = "Capacity must be at least 1")
        private int capacity;

        @NotBlank(message = "Facility type is required")
        private String type;

        private List<String> amenities;
        private List<String> imageUrls;
        private String contactPerson;
        private String contactEmail;
        private String operatingHours;
        private boolean available;
    }

    // ==================== BOOKING DTOs ====================
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingRequest {
        @NotBlank(message = "Facility ID is required")
        private String facilityId;

        @NotBlank(message = "Purpose is required")
        private String purpose;

        private String description;

        @Min(value = 1, message = "Expected attendees must be at least 1")
        private int expectedAttendees;

        @NotNull(message = "Start time is required")
        private LocalDateTime startTime;

        @NotNull(message = "End time is required")
        private LocalDateTime endTime;

        private boolean recurring;
        private String recurrencePattern;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingActionRequest {
        @NotBlank(message = "Action is required")
        private String action; // APPROVE, REJECT, CANCEL

        private String remarks;
        private String rejectionReason;
    }

    // ==================== TICKET DTOs ====================
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Description is required")
        private String description;

        private String category;

        @NotBlank(message = "Location is required")
        private String location;

        private String building;
        private int floor;
        private String roomNumber;
        private String priority;
        private List<String> attachmentUrls;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketUpdateRequest {
        private String status;
        private String assignedTo;
        private String priority;
        private String resolutionNotes;
        private LocalDateTime estimatedCompletion;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentRequest {
        @NotBlank(message = "Comment content is required")
        private String content;
    }

    // ==================== GENERIC RESPONSE ====================
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;
        private int statusCode;

        public static <T> ApiResponse<T> success(String message, T data) {
            return ApiResponse.<T>builder()
                    .success(true)
                    .message(message)
                    .data(data)
                    .statusCode(200)
                    .build();
        }

        public static <T> ApiResponse<T> error(String message, int statusCode) {
            return ApiResponse.<T>builder()
                    .success(false)
                    .message(message)
                    .statusCode(statusCode)
                    .build();
        }
    }
}
