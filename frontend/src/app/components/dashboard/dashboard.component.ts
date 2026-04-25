import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { WorkOrderService } from '../../services/work-order.service';
import { CarService } from '../../services/car.service';
import { WorkOrder, OrderStatus } from '../../models/work-order.model';
import { Car } from '../../models/car.model';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="page-header">
      <h1 class="page-title">仪表盘</h1>
      <p class="page-subtitle">
        欢迎回来，{{ authService.getCurrentUser()?.realName }}
      </p>
    </div>

    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-value">{{ stats.totalOrders }}</div>
        <div class="stat-label">总工单数</div>
      </div>
      <div class="stat-card warning" *ngIf="stats.pendingOrders !== undefined">
        <div class="stat-value">{{ stats.pendingOrders }}</div>
        <div class="stat-label">待处理</div>
      </div>
      <div class="stat-card success" *ngIf="stats.completedOrders !== undefined">
        <div class="stat-value">{{ stats.completedOrders }}</div>
        <div class="stat-label">已完成</div>
      </div>
      <div class="stat-card primary" *ngIf="stats.myCars !== undefined">
        <div class="stat-value">{{ stats.myCars }}</div>
        <div class="stat-label">我的车辆</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">最近工单</h3>
        <a routerLink="/orders" class="btn btn-secondary btn-sm">查看全部</a>
      </div>
      <div class="card-body p-0">
        <table class="table" *ngIf="recentOrders.length > 0; else noOrders">
          <thead>
            <tr>
              <th>工单编号</th>
              <th>标题</th>
              <th>车辆</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of recentOrders">
              <td>
                <span style="font-family: monospace; color: var(--color-accent);">
                  {{ order.orderNo }}
                </span>
              </td>
              <td>{{ order.title }}</td>
              <td>{{ order.carInfo }}</td>
              <td>
                <span class="badge status-{{ order.status?.toLowerCase() }}">
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <td>{{ order.createdAt | date:'yyyy-MM-dd HH:mm' }}</td>
              <td>
                <a [routerLink]="['/orders', order.id]" class="btn btn-primary btn-sm btn-icon">
                  详情
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <ng-template #noOrders>
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <div class="empty-state-title">暂无工单</div>
            <div class="empty-state-text" *ngIf="authService.isCustomer()">
              <a routerLink="/orders/create" class="btn btn-primary mt-3">立即预约服务</a>
            </div>
          </div>
        </ng-template>
      </div>
    </div>

    <div class="card mt-4" *ngIf="authService.isCustomer()">
      <div class="card-header">
        <h3 class="card-title">我的车辆</h3>
        <a routerLink="/cars" class="btn btn-secondary btn-sm">管理车辆</a>
      </div>
      <div class="card-body p-0">
        <table class="table" *ngIf="myCars.length > 0; else noCars">
          <thead>
            <tr>
              <th>车牌号</th>
              <th>品牌车型</th>
              <th>里程数</th>
              <th>上次保养</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let car of myCars">
              <td>
                <span style="font-weight: 600; color: var(--color-accent);">
                  {{ car.licensePlate }}
                </span>
              </td>
              <td>{{ car.brandName || '' }} {{ car.model }}</td>
              <td>{{ car.mileage | number }} 公里</td>
              <td>{{ car.lastMaintenanceDate || '-' }}</td>
            </tr>
          </tbody>
        </table>
        <ng-template #noCars>
          <div class="empty-state">
            <div class="empty-state-icon">🚗</div>
            <div class="empty-state-title">暂无车辆</div>
            <div class="empty-state-text">
              <a routerLink="/cars/add" class="btn btn-primary mt-3">添加车辆</a>
            </div>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats: any = {
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    myCars: 0
  };
  recentOrders: WorkOrder[] = [];
  myCars: Car[] = [];

  constructor(
    public authService: AuthService,
    private workOrderService: WorkOrderService,
    private carService: CarService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.workOrderService.getMyOrders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const orders = response.data;
          this.stats.totalOrders = orders.length;
          this.stats.pendingOrders = orders.filter(
            o => o.status === OrderStatus.PENDING || 
                 o.status === OrderStatus.ASSIGNED || 
                 o.status === OrderStatus.IN_PROGRESS
          ).length;
          this.stats.completedOrders = orders.filter(
            o => o.status === OrderStatus.COMPLETED
          ).length;
          this.recentOrders = orders.slice(0, 5);
        }
      }
    });

    if (this.authService.isCustomer()) {
      this.carService.getMyCars().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.stats.myCars = response.data.length;
            this.myCars = response.data;
          }
        }
      });
    }
  }

  getStatusLabel(status?: string): string {
    const labels: Record<string, string> = {
      'PENDING': '待分配',
      'ASSIGNED': '已分配',
      'IN_PROGRESS': '进行中',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消'
    };
    return labels[status || ''] || status || '-';
  }
}
