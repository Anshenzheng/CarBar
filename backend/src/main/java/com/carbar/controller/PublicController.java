package com.carbar.controller;

import com.carbar.dto.ApiResponse;
import com.carbar.dto.ServiceItemDTO;
import com.carbar.dto.UserDTO;
import com.carbar.enums.ServiceCategory;
import com.carbar.service.ServiceItemService;
import com.carbar.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PublicController {

    private final ServiceItemService serviceItemService;
    private final UserService userService;

    @GetMapping("/public/services")
    public ResponseEntity<ApiResponse<List<ServiceItemDTO>>> getAllServices() {
        List<ServiceItemDTO> services = serviceItemService.findAll();
        return ResponseEntity.ok(ApiResponse.success(services));
    }

    @GetMapping("/public/services/category/{category}")
    public ResponseEntity<ApiResponse<List<ServiceItemDTO>>> getServicesByCategory(@PathVariable ServiceCategory category) {
        List<ServiceItemDTO> services = serviceItemService.findByCategory(category);
        return ResponseEntity.ok(ApiResponse.success(services));
    }

    @GetMapping("/admin/technicians")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllTechnicians() {
        List<UserDTO> technicians = userService.findAllTechnicians();
        return ResponseEntity.ok(ApiResponse.success(technicians));
    }
}
