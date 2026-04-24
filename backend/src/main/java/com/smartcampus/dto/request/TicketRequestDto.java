package com.smartcampus.dto.request;

import com.smartcampus.model.enums.TicketCategory;
import com.smartcampus.model.enums.TicketPriority;

public class TicketRequestDto {
    private String location;
    private String description;
    private String preferredContact;
    private TicketCategory category;
    private TicketPriority priority;
    private String createdById;
    private String createdByName;

    public TicketRequestDto() {}

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
    public String getCreatedById() { return createdById; }
    public void setCreatedById(String createdById) { this.createdById = createdById; }
    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
}
