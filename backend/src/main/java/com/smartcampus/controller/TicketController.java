package com.smartcampus.controller;

import com.smartcampus.dto.DTOs.*;
import com.smartcampus.model.MaintenanceTicket;
import com.smartcampus.model.User;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<ApiResponse<MaintenanceTicket>> createTicket(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TicketRequest request) {
        MaintenanceTicket ticket = ticketService.createTicket(user, request);
        return ResponseEntity.ok(ApiResponse.success("Ticket created successfully", ticket));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<MaintenanceTicket>>> getMyTickets(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success("Tickets fetched", ticketService.getUserTickets(user.getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MaintenanceTicket>> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Ticket fetched", ticketService.getTicketById(id)));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<MaintenanceTicket>> addComment(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CommentRequest request) {
        MaintenanceTicket ticket = ticketService.addComment(id, user, request.getContent());
        return ResponseEntity.ok(ApiResponse.success("Comment added successfully", ticket));
    }

    // Admin / Technician endpoints
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<MaintenanceTicket>>> getAllTickets() {
        return ResponseEntity.ok(ApiResponse.success("All tickets fetched", ticketService.getAllTickets()));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<MaintenanceTicket>>> getTicketsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(ApiResponse.success("Tickets fetched",
                ticketService.getTicketsByStatus(MaintenanceTicket.TicketStatus.valueOf(status.toUpperCase()))));
    }

    @GetMapping("/assigned")
    public ResponseEntity<ApiResponse<List<MaintenanceTicket>>> getAssignedTickets(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success("Assigned tickets fetched",
                ticketService.getAssignedTickets(user.getId())));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'MANAGER')")
    public ResponseEntity<ApiResponse<MaintenanceTicket>> updateTicket(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            @RequestBody TicketUpdateRequest request) {
        MaintenanceTicket ticket = ticketService.updateTicket(id, request, user);
        return ResponseEntity.ok(ApiResponse.success("Ticket updated successfully", ticket));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.ok(ApiResponse.success("Ticket deleted", null));
    }
}
