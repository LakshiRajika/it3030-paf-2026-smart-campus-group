package com.smartcampus.service.impl;

import com.smartcampus.dto.request.TicketCommentRequestDto;
import com.smartcampus.dto.request.TicketRequestDto;
import com.smartcampus.dto.request.TicketUpdateDto;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketComment;
import com.smartcampus.model.enums.TicketStatus;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.service.NotificationService;
import com.smartcampus.service.TicketService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final NotificationService notificationService;
    private final String UPLOAD_DIR = "uploads/";

    public TicketServiceImpl(TicketRepository ticketRepository, TicketCommentRepository commentRepository,
            NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
    }

    @Override
    public Ticket createTicket(TicketRequestDto request, List<MultipartFile> attachments) {
        try {
            if (request == null)
                throw new IllegalArgumentException("Ticket request is null");

            Ticket ticket = Ticket.builder()
                    .location(request.getLocation())
                    .description(request.getDescription())
                    .preferredContact(request.getPreferredContact())
                    .category(request.getCategory())
                    .priority(request.getPriority())
                    .createdById(request.getCreatedById())
                    .status(TicketStatus.OPEN)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .attachments(new ArrayList<>())
                    .build();

            if (attachments != null && !attachments.isEmpty()) {
                if (attachments.size() > 3) {
                    throw new com.smartcampus.exception.ValidationException(
                            "Maximum 3 attachments are allowed per ticket.");
                }
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                for (MultipartFile file : attachments) {
                    if (file != null && !file.isEmpty()) {
                        String fileName = UUID.randomUUID().toString() + "_"
                                + StringUtils.cleanPath(file.getOriginalFilename());
                        Path filePath = uploadPath.resolve(fileName);
                        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                        ticket.getAttachments().add(fileName);
                    }
                }
            }

            return ticketRepository.save(ticket);
        } catch (com.smartcampus.exception.ValidationException ve) {
            throw ve;
        } catch (Exception e) {
            throw new RuntimeException("Error creating ticket: " + e.getMessage());
        }
    }

    @Override
    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    @Override
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    @Override
    public List<Ticket> getTicketsByUserId(String userId) {
        return ticketRepository.findAllByCreatedById(userId);
    }

    @Override
    public Ticket updateTicketStatus(String id, TicketUpdateDto request) {
        Ticket ticket = getTicketById(id);

        if (request.getUserId() != null && !request.getUserId().isEmpty()) {
            if (!ticket.getCreatedById().equals(request.getUserId())) {
                // Permission check logic can be added here
            }
        }

        if (request.getStatus() != null && request.getStatus() != ticket.getStatus()) {
            if (ticket.getStatus() == TicketStatus.OPEN && request.getStatus() == TicketStatus.IN_PROGRESS) {
                if (ticket.getFirstResponseAt() == null)
                    ticket.setFirstResponseAt(LocalDateTime.now());
            }
            if (request.getStatus() == TicketStatus.RESOLVED || request.getStatus() == TicketStatus.CLOSED) {
                if (ticket.getResolvedAt() == null)
                    ticket.setResolvedAt(LocalDateTime.now());
            }
            ticket.setStatus(request.getStatus());
        }

        if (request.getAssignedToId() != null)
            ticket.setAssignedToId(request.getAssignedToId());
        if (request.getResolutionNotes() != null)
            ticket.setResolutionNotes(request.getResolutionNotes());
        if (request.getLocation() != null && !request.getLocation().isEmpty())
            ticket.setLocation(request.getLocation());
        if (request.getDescription() != null && !request.getDescription().isEmpty())
            ticket.setDescription(request.getDescription());
        if (request.getPreferredContact() != null)
            ticket.setPreferredContact(request.getPreferredContact());
        if (request.getCategory() != null)
            ticket.setCategory(request.getCategory());
        if (request.getPriority() != null)
            ticket.setPriority(request.getPriority());

        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket saved = ticketRepository.save(ticket);

        try {
            notificationService.createNotification(
                    saved.getCreatedById(),
                    "Your ticket regarding " + saved.getCategory() + " has been updated.",
                    com.smartcampus.model.Notification.NotificationType.TICKET_STATUS,
                    saved.getId());
        } catch (Exception e) {
            e.printStackTrace();
        }

        return saved;
    }

    @Override
    public void deleteTicket(String id, String userId) {
        Ticket ticket = getTicketById(id);
        if (userId != null && !userId.isEmpty() && !ticket.getCreatedById().equals(userId)) {
            throw new IllegalArgumentException("User does not have permission to delete this ticket");
        }
        ticketRepository.delete(ticket);
    }

    @Override
    public List<Ticket> getTicketsByAssignedTo(String technicianId) {
        return ticketRepository.findByAssignedToId(technicianId);
    }

    @Override
    public TicketComment addComment(String ticketId, TicketCommentRequestDto commentReq) {
        getTicketById(ticketId);

        TicketComment comment = TicketComment.builder()
                .ticketId(ticketId)
                .authorId(commentReq.getAuthorId())
                .authorName(commentReq.getAuthorName())
                .content(commentReq.getContent())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        TicketComment savedComment = commentRepository.save(comment);

        try {
            Ticket ticket = getTicketById(ticketId);
            if (!ticket.getCreatedById().equals(commentReq.getAuthorId())) {
                notificationService.createNotification(
                        ticket.getCreatedById(),
                        "New comment on your ticket regarding " + ticket.getCategory(),
                        com.smartcampus.model.Notification.NotificationType.TICKET_COMMENT,
                        ticketId);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return savedComment;
    }

    @Override
    public List<TicketComment> getCommentsByTicketId(String ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    @Override
    public void deleteComment(String commentId, String userId) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (!comment.getAuthorId().equals(userId)) {
            throw new IllegalArgumentException("User does not have permission to delete this comment");
        }
        commentRepository.delete(comment);
    }

    @Override
    public TicketComment updateComment(String commentId, String userId, String content) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (!comment.getAuthorId().equals(userId)) {
            throw new IllegalArgumentException("User does not have permission to edit this comment");
        }
        comment.setContent(content);
        comment.setUpdatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    @Override
    public Map<String, Object> getAnalytics() {
        List<Ticket> tickets = ticketRepository.findAll();
        Map<String, Object> analytics = new HashMap<>();

        analytics.put("statusDistribution",
                tickets.stream().collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting())));
        analytics.put("categoryDistribution",
                tickets.stream().collect(Collectors.groupingBy(t -> t.getCategory().name(), Collectors.counting())));
        analytics.put("priorityDistribution",
                tickets.stream().collect(Collectors.groupingBy(t -> t.getPriority().name(), Collectors.counting())));

        double avgResTime = tickets.stream()
                .filter(t -> t.getResolvedAt() != null && t.getCreatedAt() != null)
                .mapToLong(t -> java.time.Duration.between(t.getCreatedAt(), t.getResolvedAt()).toHours())
                .average()
                .orElse(0.0);
        analytics.put("avgResolutionTimeHours", avgResTime);
        analytics.put("totalTickets", (long) tickets.size());

        return analytics;
    }

    @Override
    public Map<String, Long> getStats() {
        List<Ticket> tickets = ticketRepository.findAll();
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", (long) tickets.size());
        stats.put("open", tickets.stream().filter(t -> t.getStatus() == TicketStatus.OPEN).count());
        stats.put("inProgress", tickets.stream().filter(t -> t.getStatus() == TicketStatus.IN_PROGRESS).count());
        stats.put("resolved", tickets.stream()
                .filter(t -> t.getStatus() == TicketStatus.RESOLVED || t.getStatus() == TicketStatus.CLOSED).count());
        return stats;
    }
}
