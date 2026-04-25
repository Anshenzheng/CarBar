package com.carbar.service;

import com.carbar.dto.ServiceItemDTO;
import com.carbar.entity.ServiceItem;
import com.carbar.enums.ServiceCategory;
import com.carbar.repository.ServiceItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceItemService {

    private final ServiceItemRepository serviceItemRepository;

    public List<ServiceItemDTO> findAll() {
        return serviceItemRepository.findByStatus(ServiceItem.Status.ACTIVE).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ServiceItemDTO> findByCategory(ServiceCategory category) {
        return serviceItemRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ServiceItemDTO findById(Long id) {
        ServiceItem item = serviceItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("服务项目不存在"));
        return convertToDTO(item);
    }

    public Optional<ServiceItem> findEntityById(Long id) {
        return serviceItemRepository.findById(id);
    }

    @Transactional
    public ServiceItemDTO create(ServiceItemDTO dto) {
        if (serviceItemRepository.existsByServiceCode(dto.getServiceCode())) {
            throw new RuntimeException("服务编码已存在");
        }

        ServiceItem item = ServiceItem.builder()
                .serviceName(dto.getServiceName())
                .serviceCode(dto.getServiceCode())
                .category(dto.getCategory())
                .description(dto.getDescription())
                .basePrice(dto.getBasePrice())
                .estimatedDuration(dto.getEstimatedDuration())
                .status(ServiceItem.Status.ACTIVE)
                .build();

        item = serviceItemRepository.save(item);
        return convertToDTO(item);
    }

    @Transactional
    public ServiceItemDTO update(Long id, ServiceItemDTO dto) {
        ServiceItem item = serviceItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("服务项目不存在"));

        if (dto.getServiceName() != null) item.setServiceName(dto.getServiceName());
        if (dto.getDescription() != null) item.setDescription(dto.getDescription());
        if (dto.getBasePrice() != null) item.setBasePrice(dto.getBasePrice());
        if (dto.getEstimatedDuration() != null) item.setEstimatedDuration(dto.getEstimatedDuration());

        item = serviceItemRepository.save(item);
        return convertToDTO(item);
    }

    @Transactional
    public void delete(Long id) {
        ServiceItem item = serviceItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("服务项目不存在"));
        item.setStatus(ServiceItem.Status.INACTIVE);
        serviceItemRepository.save(item);
    }

    private ServiceItemDTO convertToDTO(ServiceItem item) {
        return ServiceItemDTO.builder()
                .id(item.getId())
                .serviceName(item.getServiceName())
                .serviceCode(item.getServiceCode())
                .category(item.getCategory())
                .description(item.getDescription())
                .basePrice(item.getBasePrice())
                .estimatedDuration(item.getEstimatedDuration())
                .status(item.getStatus().name())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
