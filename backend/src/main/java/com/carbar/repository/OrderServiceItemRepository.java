package com.carbar.repository;

import com.carbar.entity.OrderServiceItem;
import com.carbar.entity.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderServiceItemRepository extends JpaRepository<OrderServiceItem, Long> {
    
    List<OrderServiceItem> findByOrder(WorkOrder order);
    
    List<OrderServiceItem> findByOrderId(Long orderId);
    
    void deleteByOrderId(Long orderId);
}
