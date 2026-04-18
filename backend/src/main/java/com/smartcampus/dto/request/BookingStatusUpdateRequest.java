package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotNull;
import com.smartcampus.model.enums.BookingStatus;

public class BookingStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private BookingStatus status;

    private String reason; // required for REJECTED, optional for others

    // Getters and Setters
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}