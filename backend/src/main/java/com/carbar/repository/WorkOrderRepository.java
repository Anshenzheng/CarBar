package com.carbar.repository;

import com.carbar.entity.WorkOrder;
import com.carbar.entity.User;
import com.carbar.entity.Car;
import com.carbar.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    
    Optional<WorkOrder> findByOrderNo(String orderNo);
    
    List<WorkOrder> findByCustomer(User customer);
    
    List<WorkOrder> findByCustomerId(Long customerId);
    
    List<WorkOrder> findByTechnician(User technician);
    
    List<WorkOrder> findByTechnicianId(Long technicianId);
    
    List<WorkOrder> findByStatus(OrderStatus status);
    
    List<WorkOrder> findByCustomerIdAndStatus(Long customerId, OrderStatus status);
    
    List<WorkOrder> findByTechnicianIdAndStatus(Long technicianId, OrderStatus status);
    
    @Query("SELECT w FROM WorkOrder w WHERE w.appointmentDate BETWEEN :start AND :end")
    List<WorkOrder> findByAppointmentDateBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT w FROM WorkOrder w WHERE w.customer.id = :customerId ORDER BY w.createdAt DESC")
    List<WorkOrder> findByCustomerIdOrderByCreatedAtDesc(@Param("customerId") Long customerId);
    
    @Query("SELECT w FROM WorkOrder w WHERE w.technician.id = :technicianId ORDER BY w.createdAt DESC")
    List<WorkOrder> findByTechnicianIdOrderByCreatedAtDesc(@Param("technicianId") Long technicianId);
}
