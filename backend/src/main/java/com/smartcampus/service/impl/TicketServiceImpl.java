package com.smartcampus.service.impl;

import com.smartcampus.dto.request.TicketCommentRequestDto;
import com.smartcampus.dto.request.TicketRequestDto;
import com.smartcampus.dto.request.TicketUpdateDto;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketComment;
import com.smartcampus.model.enums.TicketStatus;
import com.smartcampus.repository.TicketCommentRepository;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final NotificationService notificationService;

    public TicketServiceImpl(TicketRepository ticketRepository, TicketCommentRepository commentRepository, NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
    }

    private final String UPLOAD_DIR = "uploads/";

    @Override
    public Ticket createTicket(TicketRequestDto request, List<MultipartFile> attachments) {
        System.out.println("Processing ticket creation for user: " + (request != null ? request.getCreatedById() : "null"));
        try {
            if (request == null) throw new IllegalArgumentException("Ticket request is null");

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
                System.out.println("Found " + attachments.size() + " attachments");
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                for (MultipartFile file : attachments) {
                    if (file != null && !file.isEmpty()) {
                        String fileName = UUID.randomUUID().toString() + "_" + StringUtils.cleanPath(file.getOriginalFilename());
                        Path filePath = uploadPath.resolve(fileName);
                        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                        ticket.getAttachments().add(fileName);
                        System.out.println("Saved file: " + fileName);
                    }
                }
            }

            Ticket savedTicket = ticketRepository.save(ticket);
            System.out.println("Ticket saved successfully with ID: " + savedTicket.getId());
            return savedTicket;
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR in createTicket: " + e.getMessage());
            e.printStackTrace();
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
        
        if (request.getStatus() != null && request.getStatus() != ticket.getStatus()) {
            if (ticket.getStatus() == TicketStatus.OPEN && request.getStatus() == TicketStatus.IN_PROGRESS) {
                if (ticket.getFirstResponseAt() == null) {
                    ticket.setFirstResponseAt(LocalDateTime.now());
                }
            }
            if (request.getStatus() == TicketStatus.RESOLVED || request.getStatus() == TicketStatus.CLOSED) {
                if (ticket.getResolvedAt() == null) {
                    ticket.setResolvedAt(LocalDateTime.now());
                }
            }
            ticket.setStatus(request.getStatus());
        }

        if (request.getAssignedToId() != null) {
            ticket.setAssignedToId(request.getAssignedToId());
        }
        
        if (request.getResolutionNotes() != null) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket saved = ticketRepository.save(ticket);
        
        try {
            notificationService.createNotification(
                saved.getCreatedById(),
                "Your ticket regarding " + saved.getCategory() + " is now " + saved.getStatus(),
                com.smartcampus.model.Notification.NotificationType.TICKET_STATUS,
                saved.getId()
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return saved;
    }

    @Override
    public List<Ticket> getTicketsByAssignedTo(String technicianId) {
        return ticketRepository.findByAssignedToId(technicianId);
    }

    @Override
    public TicketComment addComment(String ticketId, TicketCommentRequestDto commentReq) {
        getTicketById(ticketId); // verify exists

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
            // Don't notify if the author is the creator
            if (!ticket.getCreatedById().equals(commentReq.getAuthorId())) {
                notificationService.createNotification(
                    ticket.getCreatedById(),
                    "New comment on your ticket regarding " + ticket.getCategory(),
                    com.smartcampus.model.Notification.NotificationType.TICKET_COMMENT,
                    ticketId
                );
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
        
        // Status counts
        Map<String, Long> statusCounts = tickets.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting()));
        analytics.put("statusDistribution", statusCounts);
        
        // Category counts
        Map<String, Long> categoryCounts = tickets.stream()
                .collect(Collectors.groupingBy(t -> t.getCategory().name(), Collectors.counting()));
        analytics.put("categoryDistribution", categoryCounts);

        // Priority counts
        Map<String, Long> priorityCounts = tickets.stream()
                .collect(Collectors.groupingBy(t -> t.getPriority().name(), Collectors.counting()));
        analytics.put("priorityDistribution", priorityCounts);
        
        // SLA Performance (Average resolution time in hours for resolved tickets)
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
        stats.put("resolved", tickets.stream().filter(t -> t.getStatus() == TicketStatus.RESOLVED || t.getStatus() == TicketStatus.CLOSED).count());
        
        return stats;
    }
}
