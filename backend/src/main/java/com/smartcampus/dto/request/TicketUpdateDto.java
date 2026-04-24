package com.smartcampus.dto.request;

import com.smartcampus.model.enums.TicketStatus;
import com.smartcampus.model.enums.TicketCategory;
import com.smartcampus.model.enums.TicketPriority;

public class TicketUpdateDto {
    private TicketStatus status;
    private String assignedToId;
    private String resolutionNotes;
    private String location;
    private String description;
    private String preferredContact;
    private TicketCategory category;
    private TicketPriority priority;
    private String userId; // User performing the update

    public TicketUpdateDto() {}

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }
    public String getAssignedToId() { return assignedToId; }
    public void setAssignedToId(String assignedToId) { this.assignedToId = assignedToId; }
    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    
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
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
