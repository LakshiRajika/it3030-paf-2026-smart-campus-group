package com.smartcampus.controller;

import com.smartcampus.model.Notification;
import com.smartcampus.model.User;
import com.smartcampus.security.CustomUserDetails;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userDetails.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/preferences")
    public ResponseEntity<Void> updatePreferences(@AuthenticationPrincipal CustomUserDetails userDetails, 
                                                @RequestBody User.NotificationPreferences preferences) {
        notificationService.updatePreferences(userDetails.getId(), preferences);
        return ResponseEntity.ok().build();
    }
}
