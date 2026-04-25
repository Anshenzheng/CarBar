package com.carbar.entity;

import com.carbar.enums.CarStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cars")
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(name = "license_plate", nullable = false, length = 20)
    private String licensePlate;

    @Column(length = 17)
    private String vin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private CarBrand brand;

    @Column(nullable = false, length = 100)
    private String model;

    private Integer year;

    @Column(length = 30)
    private String color;

    @Builder.Default
    private Integer mileage = 0;

    @Column(name = "engine_number", length = 50)
    private String engineNumber;

    @Column(name = "last_maintenance_date")
    private LocalDate lastMaintenanceDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CarStatus status = CarStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
