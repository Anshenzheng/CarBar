package com.carbar.service;

import com.carbar.dto.CarDTO;
import com.carbar.entity.Car;
import com.carbar.entity.CarBrand;
import com.carbar.entity.User;
import com.carbar.enums.CarStatus;
import com.carbar.repository.CarBrandRepository;
import com.carbar.repository.CarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarService {

    private final CarRepository carRepository;
    private final CarBrandRepository carBrandRepository;
    private final UserService userService;

    @Transactional
    public CarDTO createCar(CarDTO carDTO) {
        if (carRepository.existsByLicensePlate(carDTO.getLicensePlate())) {
            throw new RuntimeException("车牌号已存在");
        }

        User customer = userService.findEntityById(carDTO.getCustomerId())
                .orElseThrow(() -> new RuntimeException("客户不存在"));

        CarBrand brand = null;
        if (carDTO.getBrandId() != null) {
            brand = carBrandRepository.findById(carDTO.getBrandId()).orElse(null);
        }

        Car car = Car.builder()
                .customer(customer)
                .licensePlate(carDTO.getLicensePlate())
                .vin(carDTO.getVin())
                .brand(brand)
                .model(carDTO.getModel())
                .year(carDTO.getYear())
                .color(carDTO.getColor())
                .mileage(carDTO.getMileage() != null ? carDTO.getMileage() : 0)
                .engineNumber(carDTO.getEngineNumber())
                .lastMaintenanceDate(carDTO.getLastMaintenanceDate())
                .status(CarStatus.ACTIVE)
                .build();

        car = carRepository.save(car);
        return convertToDTO(car);
    }

    @Transactional
    public CarDTO updateCar(Long id, CarDTO carDTO) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("车辆不存在"));

        if (carDTO.getLicensePlate() != null && !car.getLicensePlate().equals(carDTO.getLicensePlate())) {
            if (carRepository.existsByLicensePlate(carDTO.getLicensePlate())) {
                throw new RuntimeException("车牌号已存在");
            }
            car.setLicensePlate(carDTO.getLicensePlate());
        }

        if (carDTO.getVin() != null) car.setVin(carDTO.getVin());
        if (carDTO.getModel() != null) car.setModel(carDTO.getModel());
        if (carDTO.getYear() != null) car.setYear(carDTO.getYear());
        if (carDTO.getColor() != null) car.setColor(carDTO.getColor());
        if (carDTO.getMileage() != null) car.setMileage(carDTO.getMileage());
        if (carDTO.getEngineNumber() != null) car.setEngineNumber(carDTO.getEngineNumber());
        if (carDTO.getLastMaintenanceDate() != null) car.setLastMaintenanceDate(carDTO.getLastMaintenanceDate());
        if (carDTO.getStatus() != null) car.setStatus(carDTO.getStatus());

        if (carDTO.getBrandId() != null) {
            CarBrand brand = carBrandRepository.findById(carDTO.getBrandId()).orElse(null);
            car.setBrand(brand);
        }

        car = carRepository.save(car);
        return convertToDTO(car);
    }

    @Transactional
    public void deleteCar(Long id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("车辆不存在"));
        car.setStatus(CarStatus.INACTIVE);
        carRepository.save(car);
    }

    public CarDTO findById(Long id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("车辆不存在"));
        return convertToDTO(car);
    }

    public Optional<Car> findEntityById(Long id) {
        return carRepository.findById(id);
    }

    public List<CarDTO> findByCustomerId(Long customerId) {
        return carRepository.findByCustomerId(customerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CarDTO> getMyCars() {
        User currentUser = userService.getCurrentUserEntity();
        return carRepository.findByCustomer(currentUser).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private CarDTO convertToDTO(Car car) {
        return CarDTO.builder()
                .id(car.getId())
                .customerId(car.getCustomer() != null ? car.getCustomer().getId() : null)
                .licensePlate(car.getLicensePlate())
                .vin(car.getVin())
                .brandId(car.getBrand() != null ? car.getBrand().getId() : null)
                .brandName(car.getBrand() != null ? car.getBrand().getBrandName() : null)
                .model(car.getModel())
                .year(car.getYear())
                .color(car.getColor())
                .mileage(car.getMileage())
                .engineNumber(car.getEngineNumber())
                .lastMaintenanceDate(car.getLastMaintenanceDate())
                .status(car.getStatus())
                .createdAt(car.getCreatedAt())
                .build();
    }
}
