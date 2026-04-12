package com.smartcampus.controller;

import com.smartcampus.dto.request.TicketCommentRequestDto;
import com.smartcampus.dto.request.TicketRequestDto;
import com.smartcampus.dto.request.TicketUpdateDto;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketComment;
import com.smartcampus.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Ticket> createTicket(
            @RequestPart("ticket") TicketRequestDto request,
            @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments) {
        return ResponseEntity.ok(ticketService.createTicket(request, attachments));
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Ticket>> getTicketsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(ticketService.getTicketsByUserId(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(
            @PathVariable String id,
            @RequestBody TicketUpdateDto request) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request));
    }

    @GetMapping("/assigned/{technicianId}")
    public ResponseEntity<List<Ticket>> getAssignedTickets(@PathVariable String technicianId) {
        return ResponseEntity.ok(ticketService.getTicketsByAssignedTo(technicianId));
    }

    // Attachments download
    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            Path file = Paths.get("uploads/").resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                throw new RuntimeException("Could not read the file!");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }

    // Comments endpoints
    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<TicketComment> addComment(
            @PathVariable String ticketId,
            @RequestBody TicketCommentRequestDto request) {
        return ResponseEntity.ok(ticketService.addComment(ticketId, request));
    }

    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<TicketComment>> getComments(@PathVariable String ticketId) {
        return ResponseEntity.ok(ticketService.getCommentsByTicketId(ticketId));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<TicketComment> updateComment(
            @PathVariable String commentId,
            @RequestParam String userId,
            @RequestBody TicketCommentRequestDto request) {
        return ResponseEntity.ok(ticketService.updateComment(commentId, userId, request.getContent()));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String commentId,
            @RequestParam String userId) {
        ticketService.deleteComment(commentId, userId);
        return ResponseEntity.ok().build();
    }
}
