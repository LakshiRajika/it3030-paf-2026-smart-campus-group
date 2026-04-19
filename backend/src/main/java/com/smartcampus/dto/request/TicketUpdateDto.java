package com.smartcampus.dto.request;

import com.smartcampus.model.enums.TicketStatus;

public class TicketUpdateDto {
    private TicketStatus status;
    private String assignedToId;
    private String resolutionNotes;

    public TicketUpdateDto() {}

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }
    public String getAssignedToId() { return assignedToId; }
    public void setAssignedToId(String assignedToId) { this.assignedToId = assignedToId; }
    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
}
