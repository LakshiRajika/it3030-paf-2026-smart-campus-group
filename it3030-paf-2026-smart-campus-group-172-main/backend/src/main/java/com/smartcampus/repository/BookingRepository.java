package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByFacilityId(String facilityId);
    List<Booking> findByStatus(Booking.BookingStatus status);
    List<Booking> findByUserIdAndStatus(String userId, Booking.BookingStatus status);
    List<Booking> findByFacilityIdAndStartTimeBetween(String facilityId, LocalDateTime start, LocalDateTime end);
    List<Booking> findByFacilityIdAndStatusAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
            String facilityId, Booking.BookingStatus status, LocalDateTime endTime, LocalDateTime startTime);
    List<Booking> findAllByOrderByCreatedAtDesc();
    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);
}
