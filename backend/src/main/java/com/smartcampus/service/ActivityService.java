package com.smartcampus.service;

import com.smartcampus.model.ActivityEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ActivityService {

    public void notifyEscalation(String ticketId, String oldPriority, String newPriority) {
        ActivityEvent event = ActivityEvent.builder()
                .type("ESCALATION")
                .ticketId(ticketId)
                .message("⚠️ Ticket auto-escalated from " + oldPriority + " → " + newPriority)
                .priority(newPriority)
                .build();
        broadcastActivity(event);
    }

    public void broadcastActivity(ActivityEvent event) {
        // Since Live Activity Feed was removed, we log the event
        // In a real scenario with WebSockets, we would send this to /topic/activity
        log.info("Activity Event: {} - {} for ticket {}", event.getType(), event.getMessage(), event.getTicketId());
    }
}
