package com.carbar.service;

import com.carbar.dto.CreateOrderDTO;
import com.carbar.dto.OrderServiceItemDTO;
import com.carbar.dto.WorkOrderDTO;
import com.carbar.entity.*;
import com.carbar.enums.OrderStatus;
import com.carbar.enums.Role;
import com.carbar.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final OrderStatusLogRepository statusLogRepository;
    private final OrderServiceItemRepository orderServiceItemRepository;
    private final UserService userService;
    private final CarService carService;
    private final ServiceItemService serviceItemService;

    @Transactional
    public WorkOrderDTO createOrder(CreateOrderDTO createOrderDTO) {
        User customer = userService.getCurrentUserEntity();
        
        Car car = carService.findEntityById(createOrderDTO.getCarId())
                .orElseThrow(() -> new RuntimeException("车辆不存在"));

        if (!car.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("无权操作该车辆");
        }

        WorkOrder order = WorkOrder.builder()
                .customer(customer)
                .car(car)
                .orderType(createOrderDTO.getOrderType())
                .title(createOrderDTO.getTitle())
                .description(createOrderDTO.getDescription())
                .status(OrderStatus.PENDING)
                .priority(createOrderDTO.getPriority())
                .appointmentDate(createOrderDTO.getAppointmentDate())
                .remarks(createOrderDTO.getRemarks())
                .totalAmount(BigDecimal.ZERO)
                .serviceItems(new ArrayList<>())
                .build();

        order = workOrderRepository.save(order);

        if (createOrderDTO.getServiceItemIds() != null && !createOrderDTO.getServiceItemIds().isEmpty()) {
            BigDecimal totalAmount = BigDecimal.ZERO;
            for (Long itemId : createOrderDTO.getServiceItemIds()) {
                ServiceItem serviceItem = serviceItemService.findEntityById(itemId)
                        .orElseThrow(() -> new RuntimeException("服务项目不存在: " + itemId));

                OrderServiceItem orderItem = OrderServiceItem.builder()
                        .order(order)
                        .serviceItem(serviceItem)
                        .quantity(1)
                        .unitPrice(serviceItem.getBasePrice())
                        .subtotal(serviceItem.getBasePrice())
                        .build();

                order.getServiceItems().add(orderItem);
                totalAmount = totalAmount.add(serviceItem.getBasePrice());
            }
            order.setTotalAmount(totalAmount);
            order = workOrderRepository.save(order);
        }

        logStatusChange(order, null, OrderStatus.PENDING, customer, "创建工单");

        return convertToDTO(order);
    }

    @Transactional
    public WorkOrderDTO assignTechnician(Long orderId, Long technicianId) {
        WorkOrder order = workOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("工单不存在"));

        User technician = userService.findEntityById(technicianId)
                .orElseThrow(() -> new RuntimeException("技师不存在"));

        if (technician.getRole() != Role.TECHNICIAN) {
            throw new RuntimeException("该用户不是技师");
        }

        OrderStatus oldStatus = order.getStatus();
        order.setTechnician(technician);
        
        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.ASSIGNED);
        }

        order = workOrderRepository.save(order);

        User admin = userService.getCurrentUserEntity();
        logStatusChange(order, oldStatus, order.getStatus(), admin, 
                "指派技师: " + technician.getRealName());

        return convertToDTO(order);
    }

    @Transactional
    public WorkOrderDTO startWork(Long orderId) {
        WorkOrder order = workOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("工单不存在"));

        User technician = userService.getCurrentUserEntity();
        if (!order.getTechnician().getId().equals(technician.getId())) {
            throw new RuntimeException("无权操作该工单");
        }

        if (order.getStatus() != OrderStatus.ASSIGNED) {
            throw new RuntimeException("工单状态不正确，无法开始");
        }

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(OrderStatus.IN_PROGRESS);
        order.setStartTime(LocalDateTime.now());
        order = workOrderRepository.save(order);

        logStatusChange(order, oldStatus, OrderStatus.IN_PROGRESS, technician, "开始维修保养");

        return convertToDTO(order);
    }

    @Transactional
    public WorkOrderDTO completeWork(Long orderId, String remarks) {
        WorkOrder order = workOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("工单不存在"));

        User technician = userService.getCurrentUserEntity();
        if (!order.getTechnician().getId().equals(technician.getId())) {
            throw new RuntimeException("无权操作该工单");
        }

        if (order.getStatus() != OrderStatus.IN_PROGRESS) {
            throw new RuntimeException("工单状态不正确，无法完成");
        }

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(OrderStatus.COMPLETED);
        order.setEndTime(LocalDateTime.now());

        if (order.getStartTime() != null) {
            long minutes = java.time.Duration.between(order.getStartTime(), order.getEndTime()).toMinutes();
            order.setActualDuration((int) minutes);
        }

        order = workOrderRepository.save(order);

        logStatusChange(order, oldStatus, OrderStatus.COMPLETED, technician, 
                remarks != null ? remarks : "完成维修保养");

        return convertToDTO(order);
    }

    @Transactional
    public WorkOrderDTO cancelOrder(Long orderId, String reason) {
        WorkOrder order = workOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("工单不存在"));

        User currentUser = userService.getCurrentUserEntity();
        
        boolean isOwner = order.getCustomer().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        
        if (!isOwner && !isAdmin) {
            throw new RuntimeException("无权取消该工单");
        }

        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new RuntimeException("已完成的工单无法取消");
        }

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(OrderStatus.CANCELLED);
        order = workOrderRepository.save(order);

        logStatusChange(order, oldStatus, OrderStatus.CANCELLED, currentUser, 
                reason != null ? reason : "取消工单");

        return convertToDTO(order);
    }

    public WorkOrderDTO findById(Long id) {
        WorkOrder order = workOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("工单不存在"));
        return convertToDTO(order);
    }

    public List<WorkOrderDTO> getMyOrders() {
        User currentUser = userService.getCurrentUserEntity();
        
        List<WorkOrder> orders;
        if (currentUser.getRole() == Role.CUSTOMER) {
            orders = workOrderRepository.findByCustomerIdOrderByCreatedAtDesc(currentUser.getId());
        } else if (currentUser.getRole() == Role.TECHNICIAN) {
            orders = workOrderRepository.findByTechnicianIdOrderByCreatedAtDesc(currentUser.getId());
        } else {
            orders = workOrderRepository.findAll();
        }
        
        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<WorkOrderDTO> findByStatus(OrderStatus status) {
        User currentUser = userService.getCurrentUserEntity();
        
        List<WorkOrder> orders;
        if (currentUser.getRole() == Role.CUSTOMER) {
            orders = workOrderRepository.findByCustomerIdAndStatus(currentUser.getId(), status);
        } else if (currentUser.getRole() == Role.TECHNICIAN) {
            orders = workOrderRepository.findByTechnicianIdAndStatus(currentUser.getId(), status);
        } else {
            orders = workOrderRepository.findByStatus(status);
        }
        
        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<WorkOrderDTO> getAllOrders() {
        return workOrderRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private void logStatusChange(WorkOrder order, OrderStatus oldStatus, OrderStatus newStatus, 
                                  User operator, String remarks) {
        OrderStatusLog log = OrderStatusLog.builder()
                .order(order)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .operatorId(operator.getId())
                .operatorRole(operator.getRole())
                .remarks(remarks)
                .build();
        statusLogRepository.save(log);
    }

    private WorkOrderDTO convertToDTO(WorkOrder order) {
        String carInfo = order.getCar() != null ? 
                (order.getCar().getLicensePlate() + " " + order.getCar().getModel()) : null;
        
        return WorkOrderDTO.builder()
                .id(order.getId())
                .orderNo(order.getOrderNo())
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .customerName(order.getCustomer() != null ? order.getCustomer().getRealName() : null)
                .carId(order.getCar() != null ? order.getCar().getId() : null)
                .carInfo(carInfo)
                .technicianId(order.getTechnician() != null ? order.getTechnician().getId() : null)
                .technicianName(order.getTechnician() != null ? order.getTechnician().getRealName() : null)
                .orderType(order.getOrderType())
                .title(order.getTitle())
                .description(order.getDescription())
                .status(order.getStatus())
                .priority(order.getPriority())
                .appointmentDate(order.getAppointmentDate())
                .startTime(order.getStartTime())
                .endTime(order.getEndTime())
                .actualDuration(order.getActualDuration())
                .totalAmount(order.getTotalAmount())
                .remarks(order.getRemarks())
                .serviceItems(convertServiceItems(order.getServiceItems()))
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private List<OrderServiceItemDTO> convertServiceItems(List<OrderServiceItem> items) {
        if (items == null) return new ArrayList<>();
        return items.stream()
                .map(item -> OrderServiceItemDTO.builder()
                        .id(item.getId())
                        .serviceItemId(item.getServiceItem() != null ? item.getServiceItem().getId() : null)
                        .serviceName(item.getServiceItem() != null ? item.getServiceItem().getServiceName() : null)
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .notes(item.getNotes())
                        .build())
                .collect(Collectors.toList());
    }
}
