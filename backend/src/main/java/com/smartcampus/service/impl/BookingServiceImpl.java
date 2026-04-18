package com.smartcampus.service.impl;

import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.request.BookingStatusUpdateRequest;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.exception.ConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.UnauthorizedException;
import com.smartcampus.exception.ValidationException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Resource;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.BookingService;
import com.smartcampus.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    // ─── User Operations ────────────────────────────────────────────────────────

    @Override
    public BookingResponse createBooking(BookingRequest request, String userId) {
        // 1. Validate time range
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new ValidationException("End time must be after start time");
        }

        // 2. Validate date is not in the past
        if (request.getDate().isBefore(LocalDate.now())) {
            throw new ValidationException("Booking date cannot be in the past");
        }

        // 3. Fetch user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // 4. Fetch resource and validate it's ACTIVE
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + request.getResourceId()));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new ValidationException("Resource is not available for booking (status: " + resource.getStatus() + ")");
        }

        // 5. Validate attendees vs capacity
        if (request.getExpectedAttendees() != null && resource.getCapacity() != null) {
            if (request.getExpectedAttendees() > resource.getCapacity()) {
                throw new ValidationException("Expected attendees (" + request.getExpectedAttendees() +
                        ") exceeds resource capacity (" + resource.getCapacity() + ")");
            }
        }

        // 6. Check for scheduling conflicts
        if (hasConflict(request.getResourceId(), request.getDate(),
                request.getStartTime(), request.getEndTime(), null)) {
            throw new ConflictException("The requested time slot conflicts with an existing booking for this resource");
        }

        // 7. Create booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setResource(resource);
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);

        // 8. Notify admin (optional: depends on NotificationService implementation)
        try {
            notificationService.notifyAdminsNewBooking(saved);
        } catch (Exception e) {
            // Notification failure should not break booking creation
        }

        return toResponse(saved);
    }

    @Override
    public BookingResponse cancelBooking(String bookingId, String userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        // Only the booking owner can cancel
        if (!booking.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to cancel this booking");
        }

        // Only PENDING or APPROVED bookings can be cancelled
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new ValidationException("Only PENDING or APPROVED bookings can be cancelled. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setAdminReason("Cancelled by user");
        Booking saved = bookingRepository.save(booking);

        return toResponse(saved);
    }

    @Override
    public List<BookingResponse> getMyBookings(String userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getMyBookingsByStatus(String userId, BookingStatus status) {
        return bookingRepository.findByUserIdAndStatus(userId, status)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(String bookingId, String userId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        // Non-admins can only see their own bookings
        if (!isAdmin && !booking.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to view this booking");
        }

        return toResponse(booking);
    }

    // ─── Admin Operations ────────────────────────────────────────────────────────

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getAllBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getAllBookingsByResource(String resourceId) {
        return bookingRepository.findByResourceId(resourceId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse updateBookingStatus(String bookingId,
                                               BookingStatusUpdateRequest request,
                                               String adminId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        BookingStatus newStatus = request.getStatus();

        // Validate allowed admin transitions
        validateAdminStatusTransition(booking.getStatus(), newStatus, request.getReason());

        // If approving, re-check conflict (another booking may have been approved in between)
        if (newStatus == BookingStatus.APPROVED) {
            if (hasConflict(booking.getResource().getId(), booking.getDate(),
                    booking.getStartTime(), booking.getEndTime(), bookingId)) {
                throw new ConflictException("Cannot approve: a conflicting booking already exists for this time slot");
            }
        }

        booking.setStatus(newStatus);
        if (request.getReason() != null) {
            booking.setAdminReason(request.getReason());
        }

        Booking saved = bookingRepository.save(booking);

        // Notify the user of status change
        try {
            notificationService.notifyBookingStatusChange(saved);
        } catch (Exception e) {
            // Notification failure should not break status update
        }

        return toResponse(saved);
    }

    // ─── Conflict Detection ──────────────────────────────────────────────────────

    @Override
    public boolean hasConflict(String resourceId, LocalDate date,
                                LocalTime startTime, LocalTime endTime,
                                String excludeBookingId) {
        List<Booking> conflicts;
        if (excludeBookingId != null) {
            conflicts = bookingRepository.findConflictingBookingsExcluding(
                    resourceId, date, startTime, endTime, excludeBookingId);
        } else {
            conflicts = bookingRepository.findConflictingBookings(
                    resourceId, date, startTime, endTime);
        }
        return !conflicts.isEmpty();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private void validateAdminStatusTransition(BookingStatus current, BookingStatus next, String reason) {
        // Admin can: PENDING → APPROVED, PENDING → REJECTED, APPROVED → CANCELLED
        boolean valid = switch (current) {
            case PENDING -> next == BookingStatus.APPROVED || next == BookingStatus.REJECTED;
            case APPROVED -> next == BookingStatus.CANCELLED;
            default -> false;
        };

        if (!valid) {
            throw new ValidationException("Invalid status transition from " + current + " to " + next);
        }

        if (next == BookingStatus.REJECTED && (reason == null || reason.isBlank())) {
            throw new ValidationException("A reason is required when rejecting a booking");
        }
    }

    private BookingResponse toResponse(Booking booking) {
        BookingResponse res = new BookingResponse();
        res.setId(booking.getId());
        res.setDate(booking.getDate());
        res.setStartTime(booking.getStartTime());
        res.setEndTime(booking.getEndTime());
        res.setPurpose(booking.getPurpose());
        res.setExpectedAttendees(booking.getExpectedAttendees());
        res.setStatus(booking.getStatus());
        res.setAdminReason(booking.getAdminReason());
        res.setCreatedAt(booking.getCreatedAt());
        res.setUpdatedAt(booking.getUpdatedAt());

        if (booking.getUser() != null) {
            res.setUserId(booking.getUser().getId());
            res.setUserName(booking.getUser().getName());
            res.setUserEmail(booking.getUser().getEmail());
        }

        if (booking.getResource() != null) {
            res.setResourceId(booking.getResource().getId());
            res.setResourceName(booking.getResource().getName());
            res.setResourceType(booking.getResource().getType() != null
                    ? booking.getResource().getType().name() : null);
            res.setResourceLocation(booking.getResource().getLocation());
        }

        return res;
    }
}