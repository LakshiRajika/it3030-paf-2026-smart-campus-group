package com.smartcampus.dto.request;

import com.smartcampus.model.enums.TicketCategory;
import com.smartcampus.model.enums.TicketPriority;
import lombok.Data;

@Data
public class TicketRequestDto {
    private String location;
    private String description;
    private String preferredContact;
    private TicketCategory category;
    private TicketPriority priority;
    // Assuming for now the staff member who creates or the student ID is passed or taken from auth context.
    private String createdById;
}
