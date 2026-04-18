package com.smartcampus.service;

import com.smartcampus.dto.DTOs.*;
import com.smartcampus.model.*;
import com.smartcampus.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FacilityService facilityService;
    private final NotificationService notificationService;

    public Booking createBooking(User user, BookingRequest request) {
        Facility facility = facilityService.getFacilityById(request.getFacilityId());

        if (!facility.isAvailable()) {
            throw new RuntimeException("Facility is currently unavailable");
        }

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book for past dates");
        }

        // Check for conflicts
        List<Booking> conflicts = bookingRepository
                .findByFacilityIdAndStatusAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
                        request.getFacilityId(), Booking.BookingStatus.APPROVED,
                        request.getEndTime(), request.getStartTime());

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Time slot conflicts with existing booking");
        }

        Booking booking = Booking.builder()
                .userId(user.getId())
                .userName(user.getFirstName() + " " + user.getLastName())
                .userEmail(user.getEmail())
                .facilityId(facility.getId())
                .facilityName(facility.getName())
                .purpose(request.getPurpose())
                .description(request.getDescription())
                .expectedAttendees(request.getExpectedAttendees())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .recurring(request.isRecurring())
                .recurrencePattern(request.getRecurrencePattern())
                .status(Booking.BookingStatus.PENDING)
                .build();

        booking = bookingRepository.save(booking);

        // Notify admins
        notificationService.createNotification(
                null, // Will be handled by fetching all admins in controller
                "New Booking Request",
                user.getFirstName() + " requested booking for " + facility.getName(),
                Notification.NotificationType.SYSTEM,
                booking.getId(), "BOOKING"
        );

        return booking;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Booking> getUserBookings(String userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public List<Booking> getBookingsByStatus(Booking.BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }

    public Booking approveBooking(String bookingId, String adminId, String remarks) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be approved");
        }

        booking.setStatus(Booking.BookingStatus.APPROVED);
        booking.setApprovedBy(adminId);
        booking.setApprovedAt(LocalDateTime.now());
        booking.setAdminRemarks(remarks);
        booking.setUpdatedAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getUserId(),
                "Booking Approved",
                "Your booking for " + booking.getFacilityName() + " has been approved!",
                Notification.NotificationType.BOOKING_APPROVED,
                booking.getId(), "BOOKING"
        );

        return booking;
    }

    public Booking rejectBooking(String bookingId, String adminId, String reason) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be rejected");
        }

        booking.setStatus(Booking.BookingStatus.REJECTED);
        booking.setApprovedBy(adminId);
        booking.setRejectionReason(reason);
        booking.setUpdatedAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getUserId(),
                "Booking Rejected",
                "Your booking for " + booking.getFacilityName() + " was rejected. Reason: " + reason,
                Notification.NotificationType.BOOKING_REJECTED,
                booking.getId(), "BOOKING"
        );

        return booking;
    }

    public Booking cancelBooking(String bookingId, String userId) {
        Booking booking = getBookingById(bookingId);

        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public void deleteBooking(String id) {
        if (!bookingRepository.existsById(id)) {
            throw new RuntimeException("Booking not found");
        }
        bookingRepository.deleteById(id);
    }

    public long countByStatus(Booking.BookingStatus status) {
        return bookingRepository.findByStatus(status).size();
    }
}
