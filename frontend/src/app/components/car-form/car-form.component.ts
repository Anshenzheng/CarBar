import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CarService } from '../../services/car.service';
import { AuthService } from '../../services/auth.service';
import { Car } from '../../models/car.model';

@Component({
  selector: 'app-car-form',
  template: `
    <div class="page-header">
      <h1 class="page-title">{{ isEdit ? '编辑车辆' : '添加车辆' }}</h1>
      <p class="page-subtitle">{{ isEdit ? '修改车辆信息' : '添加新的车辆档案' }}</p>
    </div>

    <div class="card">
      <div class="card-body">
        <form [formGroup]="carForm" (ngSubmit)="onSubmit()">
          <div *ngIf="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">车牌号 *</label>
              <input 
                type="text" 
                formControlName="licensePlate" 
                class="form-control"
                placeholder="如：京A12345"
              >
            </div>

            <div class="form-group">
              <label class="form-label">车架号 (VIN)</label>
              <input 
                type="text" 
                formControlName="vin" 
                class="form-control"
                placeholder="17位车架号"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">车型 *</label>
              <input 
                type="text" 
                formControlName="model" 
                class="form-control"
                placeholder="如：奔驰 E300L"
              >
            </div>

            <div class="form-group">
              <label class="form-label">年份</label>
              <input 
                type="number" 
                formControlName="year" 
                class="form-control"
                placeholder="如：2023"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">颜色</label>
              <input 
                type="text" 
                formControlName="color" 
                class="form-control"
                placeholder="如：黑色"
              >
            </div>

            <div class="form-group">
              <label class="form-label">里程数 (公里)</label>
              <input 
                type="number" 
                formControlName="mileage" 
                class="form-control"
                placeholder="当前行驶里程"
              >
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">发动机号</label>
            <input 
              type="text" 
              formControlName="engineNumber" 
              class="form-control"
              placeholder="发动机编号"
            >
          </div>

          <div class="form-group">
            <label class="form-label">上次保养日期</label>
            <input 
              type="date" 
              formControlName="lastMaintenanceDate" 
              class="form-control"
            >
          </div>

          <div class="d-flex gap-2 mt-4">
            <button 
              type="submit" 
              class="btn btn-primary btn-lg"
              [disabled]="loading"
            >
              <span *ngIf="loading" class="loading"></span>
              <span *ngIf="!loading">{{ isEdit ? '保存修改' : '添加车辆' }}</span>
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
export class CarFormComponent implements OnInit {
  carForm!: FormGroup;
  isEdit = false;
  carId!: number;
  loading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private carService: CarService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    this.carId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.carId;

    if (this.isEdit) {
      this.loadCar();
    }
  }

  initForm(): void {
    this.carForm = this.formBuilder.group({
      licensePlate: ['', Validators.required],
      vin: [''],
      model: ['', Validators.required],
      year: [''],
      color: [''],
      mileage: [0],
      engineNumber: [''],
      lastMaintenanceDate: ['']
    });
  }

  loadCar(): void {
    this.carService.getCarById(this.carId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.carForm.patchValue({
            licensePlate: response.data.licensePlate,
            vin: response.data.vin,
            model: response.data.model,
            year: response.data.year,
            color: response.data.color,
            mileage: response.data.mileage,
            engineNumber: response.data.engineNumber,
            lastMaintenanceDate: response.data.lastMaintenanceDate
          });
        }
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    
    if (this.carForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.carForm.value;
    
    const carData: Partial<Car> = {
      customerId: this.authService.getCurrentUser()?.id,
      licensePlate: formValue.licensePlate,
      vin: formValue.vin,
      model: formValue.model,
      year: formValue.year ? Number(formValue.year) : undefined,
      color: formValue.color,
      mileage: formValue.mileage ? Number(formValue.mileage) : 0,
      engineNumber: formValue.engineNumber,
      lastMaintenanceDate: formValue.lastMaintenanceDate
    };

    if (this.isEdit) {
      this.carService.updateCar(this.carId, carData).subscribe({
        next: () => {
          this.router.navigate(['/cars']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || '保存失败';
          this.loading = false;
        }
      });
    } else {
      this.carService.createCar(carData as Car).subscribe({
        next: () => {
          this.router.navigate(['/cars']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || '添加失败';
          this.loading = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/cars']);
  }
}
