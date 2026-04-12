package com.smartcampus.service;

import com.smartcampus.dto.request.TicketCommentRequestDto;
import com.smartcampus.dto.request.TicketRequestDto;
import com.smartcampus.dto.request.TicketUpdateDto;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketComment;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TicketService {
    Ticket createTicket(TicketRequestDto request, List<MultipartFile> attachments);
    Ticket getTicketById(String id);
    List<Ticket> getAllTickets();
    List<Ticket> getTicketsByUserId(String userId);
    Ticket updateTicketStatus(String id, TicketUpdateDto request);
    
    TicketComment addComment(String ticketId, TicketCommentRequestDto commentReq);
    List<TicketComment> getCommentsByTicketId(String ticketId);
    void deleteComment(String commentId, String userId);
    TicketComment updateComment(String commentId, String userId, String content);
    List<Ticket> getTicketsByAssignedTo(String technicianId);
}
