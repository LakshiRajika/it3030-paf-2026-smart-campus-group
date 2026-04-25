package com.smartcampus.service;

import com.smartcampus.model.Notification;
import com.smartcampus.model.User;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void createNotification(String recipientId, String message, Notification.NotificationType type, String relatedId) {
        User user = userRepository.findById(recipientId).orElse(null);
        if (user == null) return;

        User.NotificationPreferences prefs = user.getNotificationPreferences();
        boolean shouldNotify = true;

        if (type == Notification.NotificationType.BOOKING_STATUS && !prefs.isBookingNotifications()) {
            shouldNotify = false;
        } else if (type == Notification.NotificationType.TICKET_STATUS && !prefs.isTicketStatusNotifications()) {
            shouldNotify = false;
        } else if (type == Notification.NotificationType.TICKET_COMMENT && !prefs.isCommentNotifications()) {
            shouldNotify = false;
        } else if (type == Notification.NotificationType.ESCALATION && !prefs.isEscalationNotifications()) {
            shouldNotify = false;
        }

        if (shouldNotify) {
            Notification notification = Notification.builder()
                    .recipientId(recipientId)
                    .message(message)
                    .type(type)
                    .relatedId(relatedId)
                    .build();
            notificationRepository.save(notification);
        }
    }

    public List<Notification> getNotificationsForUser(String userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void updatePreferences(String userId, User.NotificationPreferences preferences) {
        userRepository.findById(userId).ifPresent(u -> {
            u.setNotificationPreferences(preferences);
            userRepository.save(u);
        });
    }
}
