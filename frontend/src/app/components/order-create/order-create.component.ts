import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { WorkOrderService } from '../../services/work-order.service';
import { CarService } from '../../services/car.service';
import { ServiceItemService } from '../../services/service-item.service';
import { Car } from '../../models/car.model';
import { ServiceItem, ServiceCategory, ServiceCategoryLabels } from '../../models/service-item.model';
import { OrderType, OrderTypeLabels, Priority, PriorityLabels, CreateOrderRequest } from '../../models/work-order.model';

@Component({
  selector: 'app-order-create',
  template: `
    <div class="page-header">
      <h1 class="page-title">预约服务</h1>
      <p class="page-subtitle">创建新的维修保养工单</p>
    </div>

    <div class="card">
      <div class="card-body">
        <form [formGroup]="orderForm" (ngSubmit)="onSubmit()">
          <div *ngIf="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">选择车辆 *</label>
              <div class="select-wrapper">
                <select formControlName="carId" class="form-control">
                  <option [value]="null">请选择车辆</option>
                  <option *ngFor="let car of cars" [value]="car.id">
                    {{ car.licensePlate }} - {{ car.brandName || '' }} {{ car.model }}
                  </option>
                </select>
              </div>
              <div class="form-text">
                没有车辆？
                <a routerLink="/cars/add" target="_blank">先添加车辆</a>
              </div>
            </div>
            <div class="form-group flex-1">
              <label class="form-label">服务类型 *</label>
              <div class="select-wrapper">
                <select formControlName="orderType" class="form-control">
                  <option [value]="OrderType.MAINTENANCE">保养</option>
                  <option [value]="OrderType.REPAIR">维修</option>
                  <option [value]="OrderType.INSPECTION">检测</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">工单标题 *</label>
            <input 
              type="text" 
              formControlName="title" 
              class="form-control"
              placeholder="简要描述您的需求"
            >
          </div>

          <div class="form-group">
            <label class="form-label">问题描述</label>
            <textarea 
              formControlName="description" 
              class="form-control"
              rows="4"
              placeholder="详细描述您的问题或需求"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">优先级</label>
              <div class="select-wrapper">
                <select formControlName="priority" class="form-control">
                  <option [value]="Priority.LOW">低</option>
                  <option [value]="Priority.MEDIUM">中</option>
                  <option [value]="Priority.HIGH">高</option>
                  <option [value]="Priority.URGENT">紧急</option>
                </select>
              </div>
            </div>
            <div class="form-group flex-1">
              <label class="form-label">预约时间</label>
              <input 
                type="datetime-local" 
                formControlName="appointmentDate" 
                class="form-control"
              >
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">选择服务项目</label>
            <div class="form-text mb-2">
              可多选，系统将自动计算总金额
            </div>
            
            <div *ngFor="let category of categories" class="mb-3">
              <h4 style="color: var(--color-text-light); font-size: 14px; margin-bottom: 12px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">
                {{ ServiceCategoryLabels[category] }}
              </h4>
              <div class="checkbox-group">
                <label 
                  *ngFor="let item of getServicesByCategory(category)" 
                  class="checkbox-item"
                >
                  <input 
                    type="checkbox" 
                    [checked]="isServiceSelected(item.id!)"
                    (change)="toggleService(item.id!)"
                  >
                  <span>
                    {{ item.serviceName }}
                    <span style="color: var(--color-accent); margin-left: 8px;">
                      ¥{{ item.basePrice }}
                    </span>
                    <span *ngIf="item.estimatedDuration" style="color: var(--color-text-muted); font-size: 12px; margin-left: 8px;">
                      (约{{ item.estimatedDuration }}分钟)
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">备注</label>
            <textarea 
              formControlName="remarks" 
              class="form-control"
              rows="2"
              placeholder="其他备注信息"
            ></textarea>
          </div>

          <div class="card" style="background: var(--color-bg-light);">
            <div class="card-body">
              <div class="d-flex justify-between align-center">
                <span style="font-size: 16px; font-weight: 600;">预估总金额</span>
                <span style="font-size: 24px; font-weight: 700; color: var(--color-accent);">
                  ¥{{ totalAmount }}
                </span>
              </div>
            </div>
          </div>

          <div class="d-flex gap-2 mt-4">
            <button 
              type="submit" 
              class="btn btn-primary btn-lg"
              [disabled]="loading"
            >
              <span *ngIf="loading" class="loading"></span>
              <span *ngIf="!loading">提交预约</span>
            </button>
            <button type="button" class="btn btn-secondary btn-lg" (click)="goBack()">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class OrderCreateComponent implements OnInit {
  orderForm!: FormGroup;
  cars: Car[] = [];
  services: ServiceItem[] = [];
  categories: ServiceCategory[] = [];
  selectedServiceIds: number[] = [];
  loading = false;
  errorMessage = '';
  
  OrderType = OrderType;
  OrderTypeLabels = OrderTypeLabels;
  Priority = Priority;
  PriorityLabels = PriorityLabels;
  ServiceCategory = ServiceCategory;
  ServiceCategoryLabels = ServiceCategoryLabels;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private workOrderService: WorkOrderService,
    private carService: CarService,
    private serviceItemService: ServiceItemService
  ) {}

  get totalAmount(): number {
    let total = 0;
    for (const id of this.selectedServiceIds) {
      const service = this.services.find(s => s.id === id);
      if (service) {
        total += service.basePrice;
      }
    }
    return total;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadCars();
    this.loadServices();
  }

  initForm(): void {
    this.orderForm = this.formBuilder.group({
      carId: [null, Validators.required],
      orderType: [OrderType.MAINTENANCE, Validators.required],
      title: ['', Validators.required],
      description: [''],
      priority: [Priority.MEDIUM],
      appointmentDate: [''],
      remarks: ['']
    });
  }

  loadCars(): void {
    this.carService.getMyCars().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.cars = response.data;
        }
      }
    });
  }

  loadServices(): void {
    this.serviceItemService.getAllServices().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.services = response.data;
          this.categories = [...new Set(this.services.map(s => s.category))];
        }
      }
    });
  }

  getServicesByCategory(category: ServiceCategory): ServiceItem[] {
    return this.services.filter(s => s.category === category);
  }

  isServiceSelected(id: number): boolean {
    return this.selectedServiceIds.includes(id);
  }

  toggleService(id: number): void {
    const index = this.selectedServiceIds.indexOf(id);
    if (index > -1) {
      this.selectedServiceIds.splice(index, 1);
    } else {
      this.selectedServiceIds.push(id);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    
    if (this.orderForm.invalid) {
      return;
    }

    if (this.cars.length === 0) {
      this.errorMessage = '请先添加车辆';
      return;
    }

    this.loading = true;
    const formValue = this.orderForm.value;

    const orderData: CreateOrderRequest = {
      carId: formValue.carId,
      orderType: formValue.orderType,
      title: formValue.title,
      description: formValue.description || undefined,
      priority: formValue.priority,
      appointmentDate: formValue.appointmentDate || undefined,
      remarks: formValue.remarks || undefined,
      serviceItemIds: this.selectedServiceIds.length > 0 ? this.selectedServiceIds : undefined
    };

    this.workOrderService.createOrder(orderData).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/orders']);
        } else {
          this.errorMessage = response.message || '创建失败';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || '创建失败';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}
