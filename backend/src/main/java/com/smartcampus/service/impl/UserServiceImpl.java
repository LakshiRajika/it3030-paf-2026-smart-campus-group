package com.smartcampus.service.impl;

import com.smartcampus.model.User;
import com.smartcampus.model.enums.UserRole;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.service.UserService;
import com.smartcampus.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final NotificationRepository notificationRepository;
    private final TicketCommentRepository ticketCommentRepository;

    public UserServiceImpl(UserRepository userRepository, BookingRepository bookingRepository, TicketRepository ticketRepository, NotificationRepository notificationRepository, TicketCommentRepository ticketCommentRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
        this.notificationRepository = notificationRepository;
        this.ticketCommentRepository = ticketCommentRepository;
    }

    @Override
    public List<User> getTechnicians() {
        return userRepository.findByRolesContaining(UserRole.TECHNICIAN);
    }

    @Override
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Override
    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            user.setBookingCount(bookingRepository.countByUserId(user.getId()));
            user.setTicketCount(ticketRepository.countByCreatedById(user.getId()));
        }
        return users;
    }

    @Override
    public User updateRoles(String id, java.util.Set<UserRole> roles) {
        User user = getUserById(id);
        user.setRoles(roles);
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(String id) {
        try {
            if (!userRepository.existsById(id)) {
                throw new ResourceNotFoundException("User not found with id: " + id);
            }
            
            // Delete related bookings
            try {
                java.util.List<com.smartcampus.model.Booking> bookings = bookingRepository.findByUserId(id);
                if (bookings != null) bookingRepository.deleteAll(bookings);
            } catch (Exception e) {
                System.err.println("Error deleting user bookings: " + e.getMessage());
            }

            // Delete related tickets
            try {
                java.util.List<com.smartcampus.model.Ticket> createdTickets = ticketRepository.findByCreatedById(id);
                if (createdTickets != null) ticketRepository.deleteAll(createdTickets);
            } catch (Exception e) {
                System.err.println("Error deleting user tickets: " + e.getMessage());
            }

            // Delete related notifications
            try {
                java.util.List<com.smartcampus.model.Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(id);
                if (notifications != null) notificationRepository.deleteAll(notifications);
            } catch (Exception e) {
                System.err.println("Error deleting user notifications: " + e.getMessage());
            }

            // Delete related comments
            try {
                // Since findByAuthorId might not exist, we'll use a more general approach if needed, 
                // but for now we'll assume the repositories are working or fail gracefully.
                ticketCommentRepository.deleteAll(ticketCommentRepository.findAll().stream()
                    .filter(c -> id.equals(c.getAuthorId()))
                    .collect(java.util.stream.Collectors.toList()));
            } catch (Exception e) {
                System.err.println("Error deleting user comments: " + e.getMessage());
            }

            // Unassign tickets
            try {
                java.util.List<com.smartcampus.model.Ticket> assignedTickets = ticketRepository.findByAssignedToId(id);
                if (assignedTickets != null) {
                    for (com.smartcampus.model.Ticket ticket : assignedTickets) {
                        ticket.setAssignedToId(null);
                        ticketRepository.save(ticket);
                    }
                }
            } catch (Exception e) {
                System.err.println("Error unassigning user tickets: " + e.getMessage());
            }

            userRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Final deletion failed: " + e.getMessage(), e);
        }
    }

    @Override
    public User toggleUserStatus(String id) {
        User user = getUserById(id);
        user.setEnabled(!user.isEnabled());
        return userRepository.save(user);
    }
}
