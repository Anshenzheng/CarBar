package com.carbar.controller;

import com.carbar.dto.ApiResponse;
import com.carbar.dto.CarDTO;
import com.carbar.service.CarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CarController {

    private final CarService carService;

    @GetMapping("/customer/cars")
    public ResponseEntity<ApiResponse<List<CarDTO>>> getMyCars() {
        List<CarDTO> cars = carService.getMyCars();
        return ResponseEntity.ok(ApiResponse.success(cars));
    }

    @PostMapping("/customer/cars")
    public ResponseEntity<ApiResponse<CarDTO>> createCar(@Valid @RequestBody CarDTO carDTO) {
        CarDTO car = carService.createCar(carDTO);
        return ResponseEntity.ok(ApiResponse.success("车辆添加成功", car));
    }

    @PutMapping("/customer/cars/{id}")
    public ResponseEntity<ApiResponse<CarDTO>> updateCar(@PathVariable Long id, @RequestBody CarDTO carDTO) {
        CarDTO car = carService.updateCar(id, carDTO);
        return ResponseEntity.ok(ApiResponse.success("车辆更新成功", car));
    }

    @DeleteMapping("/customer/cars/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCar(@PathVariable Long id) {
        carService.deleteCar(id);
        return ResponseEntity.ok(ApiResponse.success("车辆删除成功", null));
    }

    @GetMapping("/cars/{id}")
    public ResponseEntity<ApiResponse<CarDTO>> getCarById(@PathVariable Long id) {
        CarDTO car = carService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(car));
    }

    @GetMapping("/admin/cars/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<CarDTO>>> getCarsByCustomer(@PathVariable Long customerId) {
        List<CarDTO> cars = carService.findByCustomerId(customerId);
        return ResponseEntity.ok(ApiResponse.success(cars));
    }
}
