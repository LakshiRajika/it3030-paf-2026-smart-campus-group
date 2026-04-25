package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.enums.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByCreatedById(String createdById);
    List<Ticket> findAllByCreatedById(String createdById);
    List<Ticket> findByAssignedToId(String assignedToId);
    List<Ticket> findByStatus(TicketStatus status);
    void deleteByCreatedById(String createdById);
    long countByCreatedById(String createdById);
}
