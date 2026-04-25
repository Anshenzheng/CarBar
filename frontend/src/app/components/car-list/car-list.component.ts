import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CarService } from '../../services/car.service';
import { Car, CarStatus } from '../../models/car.model';

@Component({
  selector: 'app-car-list',
  template: `
    <div class="page-header d-flex justify-between align-center">
      <div>
        <h1 class="page-title">车辆管理</h1>
        <p class="page-subtitle">管理您的车辆档案</p>
      </div>
      <button routerLink="/cars/add" class="btn btn-primary">
        + 添加车辆
      </button>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <table class="table" *ngIf="cars.length > 0; else noCars">
          <thead>
            <tr>
              <th>车牌号</th>
              <th>品牌车型</th>
              <th>年份</th>
              <th>颜色</th>
              <th>里程数</th>
              <th>上次保养</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let car of cars">
              <td>
                <span style="font-weight: 600; color: var(--color-accent); font-family: monospace;">
                  {{ car.licensePlate }}
                </span>
              </td>
              <td>{{ car.brandName || '' }} {{ car.model }}</td>
              <td>{{ car.year || '-' }}</td>
              <td>{{ car.color || '-' }}</td>
              <td>{{ car.mileage | number }} 公里</td>
              <td>{{ car.lastMaintenanceDate || '-' }}</td>
              <td>
                <span class="badge" [class.badge-success]="car.status === CarStatus.ACTIVE"
                      [class.badge-secondary]="car.status !== CarStatus.ACTIVE">
                  {{ car.status === CarStatus.ACTIVE ? '正常' : '停用' }}
                </span>
              </td>
              <td>
                <div class="actions">
                  <button [routerLink]="['/cars', car.id, 'edit']" class="btn btn-secondary btn-sm btn-icon">
                    编辑
                  </button>
                  <button (click)="deleteCar(car)" class="btn btn-danger btn-sm btn-icon">
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <ng-template #noCars>
          <div class="empty-state">
            <div class="empty-state-icon">🚗</div>
            <div class="empty-state-title">暂无车辆档案</div>
            <div class="empty-state-text">
              添加您的第一辆车，开始预约维修保养服务
            </div>
            <button routerLink="/cars/add" class="btn btn-primary mt-3">
              添加车辆
            </button>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class CarListComponent implements OnInit {
  cars: Car[] = [];
  CarStatus = CarStatus;

  constructor(
    private carService: CarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCars();
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

  deleteCar(car: Car): void {
    if (confirm(`确定要删除车辆 ${car.licensePlate} 吗？`)) {
      this.carService.deleteCar(car.id!).subscribe({
        next: () => {
          this.loadCars();
        }
      });
    }
  }
}
