package com.smartcampus.dto.request;

import com.smartcampus.model.enums.TicketStatus;
import lombok.Data;

@Data
public class TicketUpdateDto {
    private TicketStatus status;
    private String assignedToId;
    private String resolutionNotes;
}
