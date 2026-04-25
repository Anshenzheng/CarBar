package com.carbar.dto;

import com.carbar.enums.OrderStatus;
import com.carbar.enums.OrderType;
import com.carbar.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderDTO {
    private Long id;
    private String orderNo;
    private Long customerId;
    private String customerName;
    private Long carId;
    private String carInfo;
    private Long technicianId;
    private String technicianName;
    private OrderType orderType;
    private String title;
    private String description;
    private OrderStatus status;
    private Priority priority;
    private LocalDateTime appointmentDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer actualDuration;
    private BigDecimal totalAmount;
    private String remarks;
    private List<OrderServiceItemDTO> serviceItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
