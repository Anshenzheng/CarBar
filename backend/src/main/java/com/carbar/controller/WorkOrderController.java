package com.carbar.controller;

import com.carbar.dto.ApiResponse;
import com.carbar.dto.CreateOrderDTO;
import com.carbar.dto.WorkOrderDTO;
import com.carbar.enums.OrderStatus;
import com.carbar.service.WorkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @PostMapping("/customer/orders")
    public ResponseEntity<ApiResponse<WorkOrderDTO>> createOrder(@Valid @RequestBody CreateOrderDTO createOrderDTO) {
        WorkOrderDTO order = workOrderService.createOrder(createOrderDTO);
        return ResponseEntity.ok(ApiResponse.success("工单创建成功", order));
    }

    @GetMapping("/orders/my")
    public ResponseEntity<ApiResponse<List<WorkOrderDTO>>> getMyOrders() {
        List<WorkOrderDTO> orders = workOrderService.getMyOrders();
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<WorkOrderDTO>> getOrderById(@PathVariable Long id) {
        WorkOrderDTO order = workOrderService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @GetMapping("/orders/status/{status}")
    public ResponseEntity<ApiResponse<List<WorkOrderDTO>>> getOrdersByStatus(@PathVariable OrderStatus status) {
        List<WorkOrderDTO> orders = workOrderService.findByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PutMapping("/admin/orders/{orderId}/assign/{technicianId}")
    public ResponseEntity<ApiResponse<WorkOrderDTO>> assignTechnician(
            @PathVariable Long orderId, 
            @PathVariable Long technicianId) {
        WorkOrderDTO order = workOrderService.assignTechnician(orderId, technicianId);
        return ResponseEntity.ok(ApiResponse.success("技师指派成功", order));
    }

    @PutMapping("/technician/orders/{orderId}/start")
    public ResponseEntity<ApiResponse<WorkOrderDTO>> startWork(@PathVariable Long orderId) {
        WorkOrderDTO order = workOrderService.startWork(orderId);
        return ResponseEntity.ok(ApiResponse.success("开始维修保养", order));
    }

    @PutMapping("/technician/orders/{orderId}/complete")
    public ResponseEntity<ApiResponse<WorkOrderDTO>> completeWork(
            @PathVariable Long orderId, 
            @RequestBody(required = false) String remarks) {
        WorkOrderDTO order = workOrderService.completeWork(orderId, remarks);
        return ResponseEntity.ok(ApiResponse.success("工单已完成", order));
    }

    @PutMapping("/orders/{orderId}/cancel")
    public ResponseEntity<ApiResponse<WorkOrderDTO>> cancelOrder(
            @PathVariable Long orderId, 
            @RequestBody(required = false) String reason) {
        WorkOrderDTO order = workOrderService.cancelOrder(orderId, reason);
        return ResponseEntity.ok(ApiResponse.success("工单已取消", order));
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<ApiResponse<List<WorkOrderDTO>>> getAllOrders() {
        List<WorkOrderDTO> orders = workOrderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
}
