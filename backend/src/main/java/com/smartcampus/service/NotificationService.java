package com.smartcampus.service;

import com.smartcampus.model.Booking;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    public void sendNotification(String userId, String message) {
        System.out.println("Notification to " + userId + ": " + message);
    }

    public void notifyAdminsNewBooking(Booking booking) {
        System.out.println("Admin Notification: New Booking " + booking.getId());
    }

    public void notifyBookingStatusChange(Booking booking) {
        System.out.println("User Notification: Booking " + booking.getId() + " status changed to " + booking.getStatus());
    }
}
