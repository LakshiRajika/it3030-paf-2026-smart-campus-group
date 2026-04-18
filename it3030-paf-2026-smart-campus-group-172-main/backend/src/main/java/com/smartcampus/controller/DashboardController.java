package com.smartcampus.controller;

import com.smartcampus.dto.DTOs.ApiResponse;
import com.smartcampus.model.Booking;
import com.smartcampus.model.MaintenanceTicket;
import com.smartcampus.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final UserService userService;
    private final BookingService bookingService;
    private final TicketService ticketService;
    private final FacilityService facilityService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalUsers", userService.getTotalUsers());
        stats.put("totalFacilities", facilityService.getAllFacilities().size());
        stats.put("pendingBookings", bookingService.countByStatus(Booking.BookingStatus.PENDING));
        stats.put("approvedBookings", bookingService.countByStatus(Booking.BookingStatus.APPROVED));
        stats.put("totalBookings", bookingService.getAllBookings().size());
        stats.put("openTickets", ticketService.countByStatus(MaintenanceTicket.TicketStatus.OPEN));
        stats.put("inProgressTickets", ticketService.countByStatus(MaintenanceTicket.TicketStatus.IN_PROGRESS));
        stats.put("resolvedTickets", ticketService.countByStatus(MaintenanceTicket.TicketStatus.RESOLVED));
        stats.put("totalTickets", ticketService.getAllTickets().size());

        return ResponseEntity.ok(ApiResponse.success("Dashboard stats fetched", stats));
    }
}
