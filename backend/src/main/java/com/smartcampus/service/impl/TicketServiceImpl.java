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
import com.smartcampus.service.TicketService;
import lombok.RequiredArgsConstructor;
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

    public TicketServiceImpl(TicketRepository ticketRepository, TicketCommentRepository commentRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
    }

    private final String UPLOAD_DIR = "uploads/";

    @Override
    public Ticket createTicket(TicketRequestDto request, List<MultipartFile> attachments) {
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
                throw new IllegalArgumentException("Maximum of 3 attachments allowed.");
            }
            try {
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                for (MultipartFile file : attachments) {
                    if (!file.isEmpty()) {
                        String fileName = UUID.randomUUID().toString() + "_" + StringUtils.cleanPath(file.getOriginalFilename());
                        Path filePath = uploadPath.resolve(fileName);
                        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                        ticket.getAttachments().add(fileName);
                    }
                }
            } catch (IOException ex) {
                throw new RuntimeException("Could not store file " + ex.getMessage());
            }
        }

        return ticketRepository.save(ticket);
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
        return ticketRepository.save(ticket);
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

        return commentRepository.save(comment);
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
}
