package com.smartcampus.repository;

import com.smartcampus.model.MaintenanceTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaintenanceTicketRepository extends MongoRepository<MaintenanceTicket, String> {
    List<MaintenanceTicket> findByReportedBy(String userId);
    List<MaintenanceTicket> findByAssignedTo(String userId);
    List<MaintenanceTicket> findByStatus(MaintenanceTicket.TicketStatus status);
    List<MaintenanceTicket> findByPriority(MaintenanceTicket.Priority priority);
    List<MaintenanceTicket> findByBuilding(String building);
    List<MaintenanceTicket> findAllByOrderByCreatedAtDesc();
    List<MaintenanceTicket> findByReportedByOrderByCreatedAtDesc(String userId);
    long countByStatus(MaintenanceTicket.TicketStatus status);
}
