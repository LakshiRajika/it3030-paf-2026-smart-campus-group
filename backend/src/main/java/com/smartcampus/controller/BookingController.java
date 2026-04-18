package com.smartcampus.controller;

import com.smartcampus.dto.DTOs.*;
import com.smartcampus.model.Booking;
import com.smartcampus.model.User;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<Booking>> createBooking(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BookingRequest request) {
        Booking booking = bookingService.createBooking(user, request);
        return ResponseEntity.ok(ApiResponse.success("Booking created successfully", booking));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Booking>>> getMyBookings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success("Bookings fetched", bookingService.getUserBookings(user.getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Booking>> getBookingById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Booking fetched", bookingService.getBookingById(id)));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Booking>> cancelBooking(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        Booking booking = bookingService.cancelBooking(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled", booking));
    }

    // Admin endpoints
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Booking>>> getAllBookings() {
        return ResponseEntity.ok(ApiResponse.success("All bookings fetched", bookingService.getAllBookings()));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Booking>>> getBookingsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(ApiResponse.success("Bookings fetched",
                bookingService.getBookingsByStatus(Booking.BookingStatus.valueOf(status.toUpperCase()))));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Booking>> approveBooking(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) BookingActionRequest request) {
        String remarks = request != null ? request.getRemarks() : null;
        Booking booking = bookingService.approveBooking(id, user.getId(), remarks);
        return ResponseEntity.ok(ApiResponse.success("Booking approved", booking));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Booking>> rejectBooking(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BookingActionRequest request) {
        Booking booking = bookingService.rejectBooking(id, user.getId(), request.getRejectionReason());
        return ResponseEntity.ok(ApiResponse.success("Booking rejected", booking));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteBooking(@PathVariable String id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok(ApiResponse.success("Booking deleted", null));
    }
}
