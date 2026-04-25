package com.carbar.repository;

import com.carbar.entity.OrderStatusLog;
import com.carbar.entity.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderStatusLogRepository extends JpaRepository<OrderStatusLog, Long> {
    
    List<OrderStatusLog> findByOrder(WorkOrder order);
    
    List<OrderStatusLog> findByOrderIdOrderByCreatedAtDesc(Long orderId);
}
