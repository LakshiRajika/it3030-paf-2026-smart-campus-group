package com.smartcampus.service.impl;

import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.request.BookingStatusUpdateRequest;
import com.smartcampus.dto.response.BookingAnalyticsResponse;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingServiceImpl.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Value("${app.jwt.expirationMs}")
    private int jwtExpirationMs;

    @Value("${app.security.staff-pin:1234}")
    private String staffPin;

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

        // 2. Validate date and time
        LocalDate today = LocalDate.now();
        if (request.getDate().isBefore(today)) {
            throw new ValidationException("Booking date cannot be in the past");
        }
        
        if (request.getDate().equals(today)) {
            // Allow up to 30 mins grace period for testing/latency/clock skew issues
            if (request.getStartTime().isBefore(LocalTime.now().minusMinutes(30))) {
                throw new ValidationException("Start time (" + request.getStartTime() + ") is too far in the past. Current server time is " + LocalTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")));
            }
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

        // 8. (Optional) Admin notification could go here if implemented

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
    public BookingResponse updateBooking(String bookingId, BookingRequest request, String userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        // Only the booking owner can edit
        if (!booking.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to edit this booking");
        }

        // Only PENDING bookings can be edited
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ValidationException("Only PENDING bookings can be edited. Current status: " + booking.getStatus());
        }

        // Validate time range
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new ValidationException("End time must be after start time");
        }

        // Validate date
        LocalDate today = LocalDate.now();
        if (request.getDate().isBefore(today)) {
            throw new ValidationException("Booking date cannot be in the past");
        }
        if (request.getDate().equals(today)) {
            if (request.getStartTime().isBefore(LocalTime.now().minusMinutes(30))) {
                throw new ValidationException("Start time is too far in the past");
            }
        }

        // Fetch resource (allow changing resource)
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + request.getResourceId()));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new ValidationException("Resource is not available for booking (status: " + resource.getStatus() + ")");
        }

        // Validate attendees vs capacity
        if (request.getExpectedAttendees() != null && resource.getCapacity() != null) {
            if (request.getExpectedAttendees() > resource.getCapacity()) {
                throw new ValidationException("Expected attendees (" + request.getExpectedAttendees() +
                        ") exceeds resource capacity (" + resource.getCapacity() + ")");
            }
        }

        // Check conflict — exclude this booking from the check
        if (hasConflict(request.getResourceId(), request.getDate(),
                request.getStartTime(), request.getEndTime(), bookingId)) {
            throw new ConflictException("The requested time slot conflicts with an existing booking for this resource");
        }

        // Apply updates
        booking.setResource(resource);
        booking.setDate(request.getDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

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

        // Ensure token exists when a single booking is fetched (e.g. for QR viewing)
        booking = ensureTokenExists(booking);

        return toResponse(booking);
    }

    // ─── Admin Operations ────────────────────────────────────────────────────────

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::ensureTokenExists)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getAllBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status)
                .stream()
                .map(this::ensureTokenExists)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getAllBookingsByResource(String resourceId) {
        return bookingRepository.findByResourceId(resourceId)
                .stream()
                .map(this::ensureTokenExists)
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

        // Ensure token exists when status is updated
        booking = ensureTokenExists(booking);

        Booking saved = bookingRepository.save(booking);

        // Notify the user of status change
        try {
            notificationService.createNotification(
                    saved.getUser().getId(),
                    "Your booking for " + saved.getResource().getName() + " is now " + newStatus.name(),
                    com.smartcampus.model.Notification.NotificationType.BOOKING_STATUS,
                    saved.getId()
            );
        } catch (Exception e) {
            // Notification failure should not break status update
            e.printStackTrace();
        }

        return toResponse(saved);
    }

    @Override
    public BookingAnalyticsResponse getAnalytics() {
        logger.debug("Generating booking analytics report...");
        try {
            List<Booking> allBookings = bookingRepository.findAll();
            logger.debug("Found {} total bookings", allBookings.size());
            BookingAnalyticsResponse stats = new BookingAnalyticsResponse();

            stats.setTotalBookings(allBookings.size());

            Map<String, Long> statusDist = new HashMap<>();
            Map<String, Long> resourceDist = new HashMap<>();
            Map<Integer, Long> hourDist = new HashMap<>();

            long approvedOrCheckedInCount = 0;
            long checkedInCount = 0;

            for (Booking b : allBookings) {
                // Status distribution
                String status = b.getStatus().name();
                statusDist.put(status, statusDist.getOrDefault(status, 0L) + 1);

                // Consider both APPROVED and checked-in as "approved" for rate purposes
                if (b.getStatus() == BookingStatus.APPROVED || b.isCheckedIn()) {
                    approvedOrCheckedInCount++;
                }
                if (b.isCheckedIn()) {
                    checkedInCount++;
                }

                // Resource utilization
                if (b.getResource() != null) {
                    String name = b.getResource().getName();
                    resourceDist.put(name, resourceDist.getOrDefault(name, 0L) + 1);
                }

                // Hourly distribution
                if (b.getStartTime() != null) {
                    int hour = b.getStartTime().getHour();
                    hourDist.put(hour, hourDist.getOrDefault(hour, 0L) + 1);
                }
            }

            stats.setStatusDistribution(statusDist);
            stats.setResourceUtilization(resourceDist);
            stats.setHourlyDistribution(hourDist);

            if (stats.getTotalBookings() > 0) {
                stats.setApprovalRate((double) approvedOrCheckedInCount / stats.getTotalBookings() * 100);
            }
            if (approvedOrCheckedInCount > 0) {
                stats.setCheckInRate((double) checkedInCount / approvedOrCheckedInCount * 100);
            }

            return stats;
        } catch (Exception e) {
            logger.error("Error generating analytics: ", e);
            throw new RuntimeException("Failed to generate analytics dashboard data", e);
        }
    }

    // ─── Conflict Detection ──────────────────────────────────────────────────────

    @Override
    public BookingResponse verifyAndCheckIn(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        // 1. Must be APPROVED
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new ValidationException("Booking must be APPROVED to check in. Current status: " + booking.getStatus());
        }

        // 2. Cannot check in twice
        if (booking.isCheckedIn()) {
            throw new ValidationException("Student has already checked in for this booking at " + booking.getCheckedInAt());
        }

        // 3. Time validation (Only check in on the day of booking)
        LocalDate today = LocalDate.now();
        if (!booking.getDate().equals(today)) {
            throw new ValidationException("Check-in is only allowed on the scheduled date: " + booking.getDate());
        }

        // 4. Update status
        booking.setCheckedIn(true);
        booking.setCheckedInAt(java.time.LocalDateTime.now());
        
        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    @Override
    public BookingResponse verifyAndCheckInPublic(String id, String token, String pin) {
        // 1. PIN Check
        if (pin == null || !pin.equals(staffPin)) {
            throw new ValidationException("Invalid staff security PIN");
        }

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        // 2. Token validation
        if (booking.getCheckInToken() == null || !booking.getCheckInToken().equals(token)) {
            throw new ValidationException("Invalid check-in token");
        }

        // 2. Status validation (Must be APPROVED)
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new ValidationException("Booking must be APPROVED to check in. Current status: " + booking.getStatus());
        }

        // 3. Already checked in?
        if (booking.isCheckedIn()) {
            // If already checked in, we just return the response (idempotent for the scanner)
            return toResponse(booking);
        }

        // 4. Time validation (Only on the day of booking)
        if (!booking.getDate().equals(LocalDate.now())) {
            throw new ValidationException("Check-in is only allowed on the scheduled date: " + booking.getDate());
        }

        // 5. Update status
        booking.setCheckedIn(true);
        booking.setCheckedInAt(java.time.LocalDateTime.now());
        
        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

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

    @Override
    public void deleteBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        bookingRepository.delete(booking);
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

    private Booking ensureTokenExists(Booking booking) {
        if (booking.getCheckInToken() == null || booking.getCheckInToken().isBlank()) {
            booking.setCheckInToken(java.util.UUID.randomUUID().toString());
            return bookingRepository.save(booking);
        }
        return booking;
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
        res.setCheckedIn(booking.isCheckedIn());
        res.setCheckedInAt(booking.getCheckedInAt());
        res.setCheckInToken(booking.getCheckInToken());

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