package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import com.smartcampus.model.enums.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    // Find all bookings by a specific user
    List<Booking> findByUserId(String userId);

    // Find all bookings by status
    List<Booking> findByStatus(BookingStatus status);

    // Find bookings for a resource on a given date
    List<Booking> findByResourceIdAndDate(String resourceId, LocalDate date);

    // Find bookings by user and status
    List<Booking> findByUserIdAndStatus(String userId, BookingStatus status);

    // Find bookings by resource
    List<Booking> findByResourceId(String resourceId);

    @Query("{ 'resource.$id': { $oid: ?0 }, 'date': { $gte: ?1, $lte: ?2 }, 'status': { $in: ['PENDING', 'APPROVED'] } }")
    List<Booking> findUpcomingByResourceAndDateRange(String resourceId, LocalDate fromDate, LocalDate toDate);

    /**
     * Conflict detection: find bookings for the same resource and date
     * where the existing booking's time range overlaps with the requested range.
     * Overlapping condition: existingStart < newEnd AND existingEnd > newStart
     * Only consider PENDING or APPROVED bookings (not CANCELLED/REJECTED).
     */
    @Query("{ 'resource.$id': { $oid: ?0 }, 'date': ?1, 'status': { $in: ['PENDING', 'APPROVED'] }, " +
           "'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } }")
    List<Booking> findConflictingBookings(String resourceId, LocalDate date,
                                          LocalTime newStart, LocalTime newEnd);

    /**
     * Conflict detection excluding a specific booking id (used for future update scenarios).
     */
    @Query("{ 'resource.$id': { $oid: ?0 }, 'date': ?1, 'status': { $in: ['PENDING', 'APPROVED'] }, " +
           "'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 }, '_id': { $ne: ?4 } }")
    List<Booking> findConflictingBookingsExcluding(String resourceId, LocalDate date,
                                                    LocalTime newStart, LocalTime newEnd,
                                                    String excludeBookingId);
}