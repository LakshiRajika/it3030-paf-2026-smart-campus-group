package com.smartcampus.model;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklySlot {
    @NotBlank(message = "WeeklySlot.day is required")
    @Pattern(
            regexp = "^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)$",
            message = "WeeklySlot.day must be a valid day (e.g., MONDAY)"
    )
    private String day;

    @NotBlank(message = "WeeklySlot.from is required")
    @Pattern(
            regexp = "^([01]\\d|2[0-3]):[0-5]\\d$",
            message = "WeeklySlot.from must be in HH:mm format"
    )
    private String from;

    @NotBlank(message = "WeeklySlot.to is required")
    @Pattern(
            regexp = "^([01]\\d|2[0-3]):[0-5]\\d$",
            message = "WeeklySlot.to must be in HH:mm format"
    )
    private String to;

    @AssertTrue(message = "WeeklySlot time range is invalid (from must be before to)")
    public boolean isTimeRangeValid() {
        try {
            if (from == null || to == null) return true; // handled by @NotBlank
            return LocalTime.parse(from).isBefore(LocalTime.parse(to));
        } catch (Exception e) {
            // handled by @Pattern
            return true;
        }
    }
}
