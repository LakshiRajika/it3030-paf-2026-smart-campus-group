package com.smartcampus.service;

import com.smartcampus.model.Notification;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketComment;
import com.smartcampus.model.enums.TicketPriority;
import com.smartcampus.model.enums.TicketStatus;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;

@Service
@EnableScheduling
public class EscalationService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final NotificationService notificationService;

    // Priority escalation thresholds (in hours)
    private static final int LOW_TO_MEDIUM_HOURS = 48;
    private static final int MEDIUM_TO_HIGH_HOURS = 24;
    private static final int HIGH_TO_CRITICAL_HOURS = 12;

    public EscalationService(TicketRepository ticketRepository, 
                             TicketCommentRepository commentRepository,
                             NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
    }

    // Run every hour
    @Scheduled(fixedDelay = 3600000)
    @Transactional
    public void escalateStaleTickets() {
        List<Ticket> openTickets = ticketRepository.findByStatus(TicketStatus.OPEN);
        List<Ticket> inProgressTickets = ticketRepository.findByStatus(TicketStatus.IN_PROGRESS);
        
        for (Ticket ticket : openTickets) {
            checkAndEscalate(ticket);
        }
        
        for (Ticket ticket : inProgressTickets) {
            checkAndEscalate(ticket);
        }
    }

    private void checkAndEscalate(Ticket ticket) {
        LocalDateTime now = LocalDateTime.now();
        Duration age = Duration.between(ticket.getCreatedAt(), now);
        long hoursOld = age.toHours();
        
        TicketPriority currentPriority = ticket.getPriority();
        TicketPriority newPriority = null;
        String reason = null;
        
        // Determine if escalation is needed
        if (currentPriority == TicketPriority.LOW && hoursOld >= LOW_TO_MEDIUM_HOURS) {
            newPriority = TicketPriority.MEDIUM;
            reason = "Auto-escalated from LOW to MEDIUM due to no activity for " + LOW_TO_MEDIUM_HOURS + " hours";
        } 
        else if (currentPriority == TicketPriority.MEDIUM && hoursOld >= MEDIUM_TO_HIGH_HOURS) {
            newPriority = TicketPriority.HIGH;
            reason = "Auto-escalated from MEDIUM to HIGH due to no activity for " + MEDIUM_TO_HIGH_HOURS + " hours";
        }
        else if (currentPriority == TicketPriority.HIGH && hoursOld >= HIGH_TO_CRITICAL_HOURS) {
            newPriority = TicketPriority.CRITICAL;
            reason = "⚠️ URGENT: Auto-escalated to CRITICAL! Ticket pending for " + HIGH_TO_CRITICAL_HOURS + " hours";
        }
        
        if (newPriority != null) {
            // Update priority
            ticket.setPriority(newPriority);
            ticket.setUpdatedAt(now);
            ticketRepository.save(ticket);
            
            // Add system comment
            TicketComment systemComment = TicketComment.builder()
                    .ticketId(ticket.getId())
                    .authorId("SYSTEM")
                    .authorName("System Auto-Escalation")
                    .content(reason)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
            commentRepository.save(systemComment);
            
            // Send notifications
            if (ticket.getAssignedToId() != null) {
                notificationService.createNotification(
                    ticket.getAssignedToId(),
                    reason + " - Ticket at " + ticket.getLocation(),
                    Notification.NotificationType.ESCALATION,
                    ticket.getId()
                );
            }
            
            notificationService.createNotification(
                ticket.getCreatedById(),
                "Your ticket has been escalated to " + newPriority + " priority: " + ticket.getLocation(),
                Notification.NotificationType.ESCALATION,
                ticket.getId()
            );
        }
    }
}
