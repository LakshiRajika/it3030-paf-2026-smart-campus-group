package com.smartcampus.model;

import com.smartcampus.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Set;
import java.time.LocalDateTime;
import org.springframework.data.annotation.Transient;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String googleId;
    private String email;
    private String name;
    private String picture;
    private String password;
    private Set<UserRole> roles;
    @Builder.Default
    private boolean enabled = true;
    private LocalDateTime lastLogin;

    @Transient
    private long bookingCount;
    @Transient
    private long ticketCount;

    @Builder.Default
    private NotificationPreferences notificationPreferences = new NotificationPreferences();

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class NotificationPreferences {
        private boolean bookingNotifications = true;
        private boolean ticketStatusNotifications = true;
        private boolean commentNotifications = true;
        private boolean escalationNotifications = true;
    }
}
