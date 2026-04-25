package com.carbar.dto;

import com.carbar.enums.ServiceCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceItemDTO {
    private Long id;
    private String serviceName;
    private String serviceCode;
    private ServiceCategory category;
    private String description;
    private BigDecimal basePrice;
    private Integer estimatedDuration;
    private String status;
    private LocalDateTime createdAt;
}
