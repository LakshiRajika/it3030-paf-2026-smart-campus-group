package com.smartcampus.service;

import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.request.BookingStatusUpdateRequest;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.exception.ConflictException;
import com.smartcampus.exception.ValidationException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Resource;
import com.smartcampus.model.User;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.impl.BookingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private ResourceRepository resourceRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private User mockUser;
    private Resource mockResource;
    private BookingRequest validRequest;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId("user-1");
        mockUser.setName("Test User");
        mockUser.setEmail("test@test.com");

        mockResource = new Resource();
        mockResource.setId("resource-1");
        mockResource.setName("Lab 101");
        mockResource.setCapacity(30);
        mockResource.setStatus(ResourceStatus.ACTIVE);

        validRequest = new BookingRequest();
        validRequest.setResourceId("resource-1");
        validRequest.setDate(LocalDate.now().plusDays(1));
        validRequest.setStartTime(LocalTime.of(9, 0));
        validRequest.setEndTime(LocalTime.of(11, 0));
        validRequest.setPurpose("Team meeting");
        validRequest.setExpectedAttendees(10);
    }

    // ─── createBooking Tests ─────────────────────────────────────────────────────

    @Test
    void createBooking_Success() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(mockUser));
        when(resourceRepository.findById("resource-1")).thenReturn(Optional.of(mockResource));
        when(bookingRepository.findConflictingBookings(any(), any(), any(), any()))
                .thenReturn(Collections.emptyList());

        Booking savedBooking = new Booking();
        savedBooking.setId("booking-1");
        savedBooking.setUser(mockUser);
        savedBooking.setResource(mockResource);
        savedBooking.setDate(validRequest.getDate());
        savedBooking.setStartTime(validRequest.getStartTime());
        savedBooking.setEndTime(validRequest.getEndTime());
        savedBooking.setPurpose(validRequest.getPurpose());
        savedBooking.setExpectedAttendees(validRequest.getExpectedAttendees());
        savedBooking.setStatus(BookingStatus.PENDING);

        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        BookingResponse response = bookingService.createBooking(validRequest, "user-1");

        assertNotNull(response);
        assertEquals("booking-1", response.getId());
        assertEquals(BookingStatus.PENDING, response.getStatus());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void createBooking_ThrowsValidationException_WhenEndTimeBeforeStartTime() {
        validRequest.setStartTime(LocalTime.of(11, 0));
        validRequest.setEndTime(LocalTime.of(9, 0));

        assertThrows(ValidationException.class,
                () -> bookingService.createBooking(validRequest, "user-1"));
    }

    @Test
    void createBooking_ThrowsValidationException_WhenDateInPast() {
        validRequest.setDate(LocalDate.now().minusDays(1));

        assertThrows(ValidationException.class,
                () -> bookingService.createBooking(validRequest, "user-1"));
    }

    @Test
    void createBooking_ThrowsValidationException_WhenAttendeesExceedCapacity() {
        validRequest.setExpectedAttendees(100); // capacity is 30
        when(userRepository.findById("user-1")).thenReturn(Optional.of(mockUser));
        when(resourceRepository.findById("resource-1")).thenReturn(Optional.of(mockResource));

        assertThrows(ValidationException.class,
                () -> bookingService.createBooking(validRequest, "user-1"));
    }

    @Test
    void createBooking_ThrowsConflictException_WhenSlotConflicts() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(mockUser));
        when(resourceRepository.findById("resource-1")).thenReturn(Optional.of(mockResource));
        when(bookingRepository.findConflictingBookings(any(), any(), any(), any()))
                .thenReturn(List.of(new Booking())); // simulate conflict

        assertThrows(ConflictException.class,
                () -> bookingService.createBooking(validRequest, "user-1"));
    }

    @Test
    void createBooking_ThrowsValidationException_WhenResourceNotActive() {
        mockResource.setStatus(ResourceStatus.OUT_OF_SERVICE);
        when(userRepository.findById("user-1")).thenReturn(Optional.of(mockUser));
        when(resourceRepository.findById("resource-1")).thenReturn(Optional.of(mockResource));

        assertThrows(ValidationException.class,
                () -> bookingService.createBooking(validRequest, "user-1"));
    }

    // ─── cancelBooking Tests ─────────────────────────────────────────────────────

    @Test
    void cancelBooking_Success_WhenPending() {
        Booking booking = new Booking();
        booking.setId("booking-1");
        booking.setUser(mockUser);
        booking.setStatus(BookingStatus.PENDING);

        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any())).thenReturn(booking);

        BookingResponse response = bookingService.cancelBooking("booking-1", "user-1");
        assertEquals(BookingStatus.CANCELLED, response.getStatus());
    }

    @Test
    void cancelBooking_ThrowsException_WhenAlreadyRejected() {
        Booking booking = new Booking();
        booking.setId("booking-1");
        booking.setUser(mockUser);
        booking.setStatus(BookingStatus.REJECTED);

        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(booking));

        assertThrows(ValidationException.class,
                () -> bookingService.cancelBooking("booking-1", "user-1"));
    }

    // ─── updateBookingStatus Tests ───────────────────────────────────────────────

    @Test
    void updateBookingStatus_Approve_Success() {
        Booking booking = new Booking();
        booking.setId("booking-1");
        booking.setUser(mockUser);
        booking.setResource(mockResource);
        booking.setDate(LocalDate.now().plusDays(1));
        booking.setStartTime(LocalTime.of(9, 0));
        booking.setEndTime(LocalTime.of(11, 0));
        booking.setStatus(BookingStatus.PENDING);

        BookingStatusUpdateRequest req = new BookingStatusUpdateRequest();
        req.setStatus(BookingStatus.APPROVED);

        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(booking));
        when(bookingRepository.findConflictingBookingsExcluding(any(), any(), any(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(bookingRepository.save(any())).thenReturn(booking);

        BookingResponse response = bookingService.updateBookingStatus("booking-1", req, "admin-1");
        assertEquals(BookingStatus.APPROVED, response.getStatus());
    }

    @Test
    void updateBookingStatus_Reject_RequiresReason() {
        Booking booking = new Booking();
        booking.setId("booking-1");
        booking.setUser(mockUser);
        booking.setStatus(BookingStatus.PENDING);

        BookingStatusUpdateRequest req = new BookingStatusUpdateRequest();
        req.setStatus(BookingStatus.REJECTED);
        // No reason provided

        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(booking));

        assertThrows(ValidationException.class,
                () -> bookingService.updateBookingStatus("booking-1", req, "admin-1"));
    }

    @Test
    void updateBookingStatus_InvalidTransition_ThrowsValidationException() {
        Booking booking = new Booking();
        booking.setId("booking-1");
        booking.setUser(mockUser);
        booking.setStatus(BookingStatus.CANCELLED); // already cancelled

        BookingStatusUpdateRequest req = new BookingStatusUpdateRequest();
        req.setStatus(BookingStatus.APPROVED);

        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(booking));

        assertThrows(ValidationException.class,
                () -> bookingService.updateBookingStatus("booking-1", req, "admin-1"));
    }

    // ─── hasConflict Tests ───────────────────────────────────────────────────────

    @Test
    void hasConflict_ReturnsFalse_WhenNoConflicts() {
        when(bookingRepository.findConflictingBookings(any(), any(), any(), any()))
                .thenReturn(Collections.emptyList());

        boolean result = bookingService.hasConflict("resource-1",
                LocalDate.now().plusDays(1),
                LocalTime.of(9, 0), LocalTime.of(11, 0), null);

        assertFalse(result);
    }

    @Test
    void hasConflict_ReturnsTrue_WhenConflictsExist() {
        when(bookingRepository.findConflictingBookings(any(), any(), any(), any()))
                .thenReturn(List.of(new Booking()));

        boolean result = bookingService.hasConflict("resource-1",
                LocalDate.now().plusDays(1),
                LocalTime.of(9, 0), LocalTime.of(11, 0), null);

        assertTrue(result);
    }
}