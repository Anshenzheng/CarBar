package com.carbar.repository;

import com.carbar.entity.CarBrand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarBrandRepository extends JpaRepository<CarBrand, Long> {
    
    Optional<CarBrand> findByBrandName(String brandName);
    
    boolean existsByBrandName(String brandName);
}
