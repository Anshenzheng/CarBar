package com.carbar.dto;

import com.carbar.enums.CarStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarDTO {
    private Long id;
    private Long customerId;
    private String licensePlate;
    private String vin;
    private Long brandId;
    private String brandName;
    private String model;
    private Integer year;
    private String color;
    private Integer mileage;
    private String engineNumber;
    private LocalDate lastMaintenanceDate;
    private CarStatus status;
    private LocalDateTime createdAt;
}
