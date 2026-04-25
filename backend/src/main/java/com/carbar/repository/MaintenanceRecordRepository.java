package com.carbar.repository;

import com.carbar.entity.MaintenanceRecord;
import com.carbar.entity.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {
    
    Optional<MaintenanceRecord> findByOrder(WorkOrder order);
    
    Optional<MaintenanceRecord> findByOrderId(Long orderId);
    
    List<MaintenanceRecord> findByTechnicianId(Long technicianId);
}
