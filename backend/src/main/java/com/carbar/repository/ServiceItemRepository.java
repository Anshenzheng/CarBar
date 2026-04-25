package com.carbar.repository;

import com.carbar.entity.ServiceItem;
import com.carbar.enums.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {
    
    Optional<ServiceItem> findByServiceCode(String serviceCode);
    
    List<ServiceItem> findByCategory(ServiceCategory category);
    
    List<ServiceItem> findByStatus(ServiceItem.Status status);
    
    boolean existsByServiceCode(String serviceCode);
}
