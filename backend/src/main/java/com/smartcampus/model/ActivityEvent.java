package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityEvent {
    private String type;
    private String ticketId;
    private String message;
    private String priority;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
