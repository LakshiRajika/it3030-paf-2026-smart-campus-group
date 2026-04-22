package com.smartcampus.model;

import com.smartcampus.model.enums.TicketCategory;
import com.smartcampus.model.enums.TicketPriority;
import com.smartcampus.model.enums.TicketStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;
    
    private String createdById;
    private String createdByName;
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

    public Ticket() {}

    // Manual Builder replacement to fix compile errors
    public static class TicketBuilder {
        private Ticket ticket = new Ticket();
        public TicketBuilder id(String id) { ticket.id = id; return this; }
        public TicketBuilder createdById(String createdById) { ticket.createdById = createdById; return this; }
        public TicketBuilder createdByName(String createdByName) { ticket.createdByName = createdByName; return this; }
        public TicketBuilder location(String location) { ticket.location = location; return this; }
        public TicketBuilder description(String description) { ticket.description = description; return this; }
        public TicketBuilder preferredContact(String preferredContact) { ticket.preferredContact = preferredContact; return this; }
        public TicketBuilder category(TicketCategory category) { ticket.category = category; return this; }
        public TicketBuilder priority(TicketPriority priority) { ticket.priority = priority; return this; }
        public TicketBuilder status(TicketStatus status) { ticket.status = status; return this; }
        public TicketBuilder attachments(List<String> attachments) { ticket.attachments = attachments; return this; }
        public TicketBuilder createdAt(LocalDateTime createdAt) { ticket.createdAt = createdAt; return this; }
        public TicketBuilder updatedAt(LocalDateTime updatedAt) { ticket.updatedAt = updatedAt; return this; }
        public Ticket build() { return ticket; }
    }

    public static TicketBuilder builder() { return new TicketBuilder(); }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCreatedById() { return createdById; }
    public void setCreatedById(String createdById) { this.createdById = createdById; }
    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPreferredContact() { return preferredContact; }
    public void setPreferredContact(String preferredContact) { this.preferredContact = preferredContact; }
    public TicketCategory getCategory() { return category; }
    public void setCategory(TicketCategory category) { this.category = category; }
    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }
    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }
    public String getAssignedToId() { return assignedToId; }
    public void setAssignedToId(String assignedToId) { this.assignedToId = assignedToId; }
    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    public List<String> getAttachments() { return attachments; }
    public void setAttachments(List<String> attachments) { this.attachments = attachments; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getFirstResponseAt() { return firstResponseAt; }
    public void setFirstResponseAt(LocalDateTime firstResponseAt) { this.firstResponseAt = firstResponseAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}
