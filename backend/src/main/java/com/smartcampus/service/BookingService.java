package com.smartcampus.service;

import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.request.BookingStatusUpdateRequest;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.model.enums.BookingStatus;

import java.util.List;

public interface BookingService {

    // User operations
    BookingResponse createBooking(BookingRequest request, String userId);
    BookingResponse cancelBooking(String bookingId, String userId);
    List<BookingResponse> getMyBookings(String userId);
    List<BookingResponse> getMyBookingsByStatus(String userId, BookingStatus status);
    BookingResponse getBookingById(String bookingId, String userId, boolean isAdmin);

    // Admin operations
    List<BookingResponse> getAllBookings();
    List<BookingResponse> getAllBookingsByStatus(BookingStatus status);
    List<BookingResponse> getAllBookingsByResource(String resourceId);
    BookingResponse updateBookingStatus(String bookingId, BookingStatusUpdateRequest request, String adminId);

    // Conflict check (also used internally)
    boolean hasConflict(String resourceId, java.time.LocalDate date,
                        java.time.LocalTime startTime, java.time.LocalTime endTime,
                        String excludeBookingId);
}