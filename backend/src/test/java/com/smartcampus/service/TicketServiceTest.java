package com.smartcampus.service;

import com.smartcampus.dto.request.TicketCommentRequestDto;
import com.smartcampus.dto.request.TicketRequestDto;
import com.smartcampus.dto.request.TicketUpdateDto;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.ValidationException;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketComment;
import com.smartcampus.model.enums.TicketCategory;
import com.smartcampus.model.enums.TicketPriority;
import com.smartcampus.model.enums.TicketStatus;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.service.impl.TicketServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketCommentRepository commentRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TicketServiceImpl ticketService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateTicket_Success() {
        TicketRequestDto request = new TicketRequestDto();
        request.setCreatedById("user123");
        request.setLocation("Room 101");
        request.setDescription("Broken projector");
        request.setCategory(TicketCategory.HARDWARE);
        request.setPriority(TicketPriority.HIGH);

        Ticket savedTicket = Ticket.builder()
                .id("t1").createdById("user123").status(TicketStatus.OPEN).build();

        when(ticketRepository.save(any(Ticket.class))).thenReturn(savedTicket);

        Ticket result = ticketService.createTicket(request, null);

        assertNotNull(result);
        assertEquals("t1", result.getId());
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    @Test
    void testCreateTicket_TooManyAttachments_ThrowsException() {
        TicketRequestDto request = new TicketRequestDto();
        request.setCreatedById("user123");

        List<MultipartFile> attachments = new ArrayList<>();
        attachments.add(new MockMultipartFile("file1", new byte[0]));
        attachments.add(new MockMultipartFile("file2", new byte[0]));
        attachments.add(new MockMultipartFile("file3", new byte[0]));
        attachments.add(new MockMultipartFile("file4", new byte[0]));

        assertThrows(ValidationException.class, () -> {
            ticketService.createTicket(request, attachments);
        });
    }

    @Test
    void testUpdateTicketStatus_SetsFirstResponseTimer() {
        Ticket existingTicket = Ticket.builder().id("t1").status(TicketStatus.OPEN).build();
        when(ticketRepository.findById("t1")).thenReturn(java.util.Optional.of(existingTicket));
        when(ticketRepository.save(any())).thenReturn(existingTicket);

        TicketUpdateDto dto = new TicketUpdateDto();
        dto.setStatus(TicketStatus.IN_PROGRESS);

        Ticket result = ticketService.updateTicketStatus("t1", dto);
        
        assertNotNull(result.getFirstResponseAt());
        assertEquals(TicketStatus.IN_PROGRESS, result.getStatus());
    }

    @Test
    void testDeleteComment_WrongUser_ThrowsException() {
        TicketComment comment = TicketComment.builder().authorId("author1").build();
        when(commentRepository.findById("c1")).thenReturn(Optional.of(comment));

        assertThrows(IllegalArgumentException.class, () -> {
            ticketService.deleteComment("c1", "wrong_author");
        });
    }
}
