package com.smartcampus.model;

import com.smartcampus.model.enums.TicketCategory;
import com.smartcampus.model.enums.TicketPriority;
import com.smartcampus.model.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;
    
    private String createdById;
    private String location; 
    
    private String description;
    private String preferredContact;
    
    private TicketCategory category;
    private TicketPriority priority;
    private TicketStatus status;
    
    private String assignedToId;
    private String resolutionNotes;
    
    private List<String> attachments = new ArrayList<>();
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // SLAs
    private LocalDateTime firstResponseAt;
    private LocalDateTime resolvedAt;
}
