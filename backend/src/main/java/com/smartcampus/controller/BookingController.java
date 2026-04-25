package com.smartcampus.controller;

import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.request.BookingStatusUpdateRequest;
import com.smartcampus.dto.response.BookingAnalyticsResponse;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.security.CustomUserDetails;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * BookingController – Module B: Booking Management
 *
 * Endpoints:
 *  POST   /api/bookings                          – Create a booking (USER)
 *  GET    /api/bookings/my                       – Get own bookings (USER)
 *  GET    /api/bookings/my?status=PENDING        – Filter own bookings by status (USER)
 *  GET    /api/bookings/{id}                     – Get single booking (USER/ADMIN)
 *  PATCH  /api/bookings/{id}/cancel              – Cancel own booking (USER)
 *  GET    /api/bookings                          – Get ALL bookings (ADMIN)
 *  PATCH  /api/bookings/{id}/status              – Approve/Reject booking (ADMIN)
 *  GET    /api/bookings/check-conflict           – Check slot availability (USER/ADMIN)
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // ─── USER Endpoints ──────────────────────────────────────────────────────────

    /**
     * POST /api/bookings
     * Create a new booking request. Status defaults to PENDING.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'TECHNICIAN', 'MANAGER')")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        BookingResponse response = bookingService.createBooking(request, userDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/bookings/{id}
     * Edit a PENDING booking (owner only). Can change resource, date, time, purpose, attendees.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'TECHNICIAN', 'MANAGER')")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        BookingResponse response = bookingService.updateBooking(id, request, userDetails.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/bookings/my
     * Get the authenticated user's own bookings.
     * Optional query param: ?status=PENDING|APPROVED|REJECTED|CANCELLED
     */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'TECHNICIAN', 'MANAGER')")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @RequestParam(required = false) BookingStatus status,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        List<BookingResponse> bookings = (status != null)
                ? bookingService.getMyBookingsByStatus(userDetails.getId(), status)
                : bookingService.getMyBookings(userDetails.getId());

        return ResponseEntity.ok(bookings);
    }

    /**
     * GET /api/bookings/{id}
     * Get a specific booking by ID.
     * Users can only see their own; Admins can see any.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'TECHNICIAN', 'MANAGER')")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        BookingResponse response = bookingService.getBookingById(id, userDetails.getId(), isAdmin);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/bookings/{id}/cancel
     * Cancel a booking (only the booking owner can cancel).
     * Only PENDING or APPROVED bookings can be cancelled.
     */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'TECHNICIAN', 'MANAGER')")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        BookingResponse response = bookingService.cancelBooking(id, userDetails.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/bookings/check-conflict
     * Check if a time slot is available for a facility (before creating a booking).
     * Query params: facilityId, date (yyyy-MM-dd), startTime (HH:mm), endTime (HH:mm)
     */
    @GetMapping("/check-conflict")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'TECHNICIAN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> checkConflict(
            @RequestParam String resourceId,
            @RequestParam String date,
            @RequestParam String startTime,
            @RequestParam String endTime,
            @RequestParam(required = false) String excludeId) {

        java.time.LocalDate localDate = java.time.LocalDate.parse(date);
        java.time.LocalTime start = java.time.LocalTime.parse(startTime);
        java.time.LocalTime end = java.time.LocalTime.parse(endTime);

        boolean conflict = bookingService.hasConflict(resourceId, localDate, start, end, excludeId);

        return ResponseEntity.ok(Map.of(
                "hasConflict", conflict,
                "available", !conflict,
                "resourceId", resourceId,
                "date", date,
                "startTime", startTime,
                "endTime", endTime
        ));
    }

    // ─── ADMIN Endpoints ─────────────────────────────────────────────────────────

    /**
     * GET /api/bookings
     * Get all bookings in the system (Admin only).
     * Optional filters: ?status=PENDING, ?resourceId=xxx
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String resourceId) {

        List<BookingResponse> bookings;

        if (status != null) {
            bookings = bookingService.getAllBookingsByStatus(status);
        } else if (resourceId != null) {
            bookings = bookingService.getAllBookingsByResource(resourceId);
        } else {
            bookings = bookingService.getAllBookings();
        }

        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/resource/{resourceId}/upcoming")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<BookingResponse>> getUpcomingByResource(
            @PathVariable String resourceId,
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(bookingService.getUpcomingBookingsByResource(resourceId, days));
    }

    /**
     * GET /api/bookings/analytics
     * Get aggregated booking statistics for the admin dashboard.
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingAnalyticsResponse> getAnalytics() {
        BookingAnalyticsResponse response = bookingService.getAnalytics();
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/bookings/{id}/status
     * Admin reviews a booking: APPROVE, REJECT (with reason), or CANCEL.
     * Transitions: PENDING→APPROVED, PENDING→REJECTED, APPROVED→CANCELLED
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable String id,
            @Valid @RequestBody BookingStatusUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        BookingResponse response = bookingService.updateBookingStatus(id, request, userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> checkIn(@PathVariable String id) {
        BookingResponse response = bookingService.verifyAndCheckIn(id);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/bookings/public/check-in/{id}
     * Public endpoint to mark a student as checked in after scanning their QR code.
     * Uses a secret token for security instead of standard authentication.
     */
    @PostMapping("/public/check-in/{id}")
    public ResponseEntity<BookingResponse> checkInPublic(
            @PathVariable String id,
            @RequestParam String token,
            @RequestParam String pin) {
        BookingResponse response = bookingService.verifyAndCheckInPublic(id, token, pin);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/bookings/{id}
     * Hard-delete a booking record (Admin only, for cleanup purposes).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteBooking(@PathVariable String id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok(Map.of("message", "Booking deleted successfully", "id", id));
    }
}