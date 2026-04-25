package com.carbar.dto;

import com.carbar.enums.OrderStatus;
import com.carbar.enums.OrderType;
import com.carbar.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderDTO {
    
    @NotNull(message = "车辆ID不能为空")
    private Long carId;
    
    @NotNull(message = "工单类型不能为空")
    private OrderType orderType;
    
    @NotBlank(message = "工单标题不能为空")
    private String title;
    
    private String description;
    
    @Builder.Default
    private Priority priority = Priority.MEDIUM;
    
    private LocalDateTime appointmentDate;
    
    private String remarks;
    
    private List<Long> serviceItemIds;
}
