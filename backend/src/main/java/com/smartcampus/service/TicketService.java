package com.smartcampus.service;

import com.smartcampus.dto.DTOs.*;
import com.smartcampus.model.*;
import com.smartcampus.repository.MaintenanceTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final MaintenanceTicketRepository ticketRepository;
    private final NotificationService notificationService;

    public MaintenanceTicket createTicket(User user, TicketRequest request) {
        MaintenanceTicket ticket = MaintenanceTicket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .location(request.getLocation())
                .building(request.getBuilding())
                .floor(request.getFloor())
                .roomNumber(request.getRoomNumber())
                .priority(request.getPriority() != null ?
                        MaintenanceTicket.Priority.valueOf(request.getPriority()) :
                        MaintenanceTicket.Priority.MEDIUM)
                .status(MaintenanceTicket.TicketStatus.OPEN)
                .reportedBy(user.getId())
                .reporterName(user.getFirstName() + " " + user.getLastName())
                .reporterEmail(user.getEmail())
                .attachmentUrls(request.getAttachmentUrls())
                .build();

        ticket = ticketRepository.save(ticket);

        notificationService.createNotification(
                user.getId(),
                "Ticket Created",
                "Your maintenance ticket '" + ticket.getTitle() + "' has been submitted.",
                Notification.NotificationType.TICKET_CREATED,
                ticket.getId(), "TICKET"
        );

        return ticket;
    }

    public List<MaintenanceTicket> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<MaintenanceTicket> getUserTickets(String userId) {
        return ticketRepository.findByReportedByOrderByCreatedAtDesc(userId);
    }

    public MaintenanceTicket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public List<MaintenanceTicket> getTicketsByStatus(MaintenanceTicket.TicketStatus status) {
        return ticketRepository.findByStatus(status);
    }

    public List<MaintenanceTicket> getAssignedTickets(String userId) {
        return ticketRepository.findByAssignedTo(userId);
    }

    public MaintenanceTicket updateTicket(String ticketId, TicketUpdateRequest request, User updater) {
        MaintenanceTicket ticket = getTicketById(ticketId);

        MaintenanceTicket.TicketStatus oldStatus = ticket.getStatus();

        if (request.getStatus() != null) {
            MaintenanceTicket.TicketStatus newStatus = MaintenanceTicket.TicketStatus.valueOf(request.getStatus());
            ticket.setStatus(newStatus);

            if (newStatus == MaintenanceTicket.TicketStatus.RESOLVED) {
                ticket.setResolvedAt(LocalDateTime.now());
            }
        }

        if (request.getAssignedTo() != null) {
            ticket.setAssignedTo(request.getAssignedTo());

            notificationService.createNotification(
                    request.getAssignedTo(),
                    "Ticket Assigned",
                    "You have been assigned ticket: " + ticket.getTitle(),
                    Notification.NotificationType.TICKET_ASSIGNED,
                    ticket.getId(), "TICKET"
            );
        }

        if (request.getPriority() != null) {
            ticket.setPriority(MaintenanceTicket.Priority.valueOf(request.getPriority()));
        }

        if (request.getResolutionNotes() != null) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }

        if (request.getEstimatedCompletion() != null) {
            ticket.setEstimatedCompletion(request.getEstimatedCompletion());
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        ticket = ticketRepository.save(ticket);

        // Notify reporter of status change
        if (request.getStatus() != null && !oldStatus.name().equals(request.getStatus())) {
            Notification.NotificationType notifType;
            switch (MaintenanceTicket.TicketStatus.valueOf(request.getStatus())) {
                case RESOLVED -> notifType = Notification.NotificationType.TICKET_RESOLVED;
                case CLOSED -> notifType = Notification.NotificationType.TICKET_CLOSED;
                default -> notifType = Notification.NotificationType.TICKET_UPDATED;
            }

            notificationService.createNotification(
                    ticket.getReportedBy(),
                    "Ticket Updated",
                    "Your ticket '" + ticket.getTitle() + "' status changed to " + request.getStatus(),
                    notifType,
                    ticket.getId(), "TICKET"
            );
        }

        return ticket;
    }

    public MaintenanceTicket addComment(String ticketId, User user, String content) {
        MaintenanceTicket ticket = getTicketById(ticketId);

        MaintenanceTicket.Comment comment = MaintenanceTicket.Comment.builder()
                .id(UUID.randomUUID().toString())
                .userId(user.getId())
                .userName(user.getFirstName() + " " + user.getLastName())
                .userRole(user.getRole().name())
                .content(content)
                .build();

        ticket.getComments().add(comment);
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket = ticketRepository.save(ticket);

        // Notify ticket reporter about new comment (if commenter is not the reporter)
        if (!user.getId().equals(ticket.getReportedBy())) {
            notificationService.createNotification(
                    ticket.getReportedBy(),
                    "New Comment on Ticket",
                    user.getFirstName() + " commented on your ticket: " + ticket.getTitle(),
                    Notification.NotificationType.NEW_COMMENT,
                    ticket.getId(), "TICKET"
            );
        }

        // Notify assigned technician about new comment (if different from commenter)
        if (ticket.getAssignedTo() != null && !user.getId().equals(ticket.getAssignedTo())) {
            notificationService.createNotification(
                    ticket.getAssignedTo(),
                    "New Comment on Assigned Ticket",
                    user.getFirstName() + " commented on ticket: " + ticket.getTitle(),
                    Notification.NotificationType.NEW_COMMENT,
                    ticket.getId(), "TICKET"
            );
        }

        return ticket;
    }

    public void deleteTicket(String id) {
        if (!ticketRepository.existsById(id)) {
            throw new RuntimeException("Ticket not found");
        }
        ticketRepository.deleteById(id);
    }

    public long countByStatus(MaintenanceTicket.TicketStatus status) {
        return ticketRepository.countByStatus(status);
    }
}
