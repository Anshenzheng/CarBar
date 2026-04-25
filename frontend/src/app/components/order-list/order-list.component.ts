import { Component, OnInit } from '@angular/core';
import { WorkOrderService } from '../../services/work-order.service';
import { AuthService } from '../../services/auth.service';
import { WorkOrder, OrderStatus, OrderStatusLabels } from '../../models/work-order.model';

@Component({
  selector: 'app-order-list',
  template: `
    <div class="page-header d-flex justify-between align-center">
      <div>
        <h1 class="page-title">{{ pageTitle }}</h1>
        <p class="page-subtitle">{{ pageSubtitle }}</p>
      </div>
      <button 
        *ngIf="authService.isCustomer()" 
        routerLink="/orders/create" 
        class="btn btn-primary"
      >
        + 预约服务
      </button>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <span class="filter-label">状态筛选：</span>
        <select [(ngModel)]="filterStatus" (change)="filterOrders()" class="form-control" style="width: 150px;">
          <option value="">全部</option>
          <option [value]="OrderStatus.PENDING">待分配</option>
          <option [value]="OrderStatus.ASSIGNED">已分配</option>
          <option [value]="OrderStatus.IN_PROGRESS">进行中</option>
          <option [value]="OrderStatus.COMPLETED">已完成</option>
          <option [value]="OrderStatus.CANCELLED">已取消</option>
        </select>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <table class="table" *ngIf="displayOrders.length > 0; else noOrders">
          <thead>
            <tr>
              <th>工单编号</th>
              <th>标题</th>
              <th>车辆</th>
              <th *ngIf="!authService.isCustomer()">客户</th>
              <th>技师</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of displayOrders">
              <td>
                <span style="font-family: monospace; color: var(--color-accent);">
                  {{ order.orderNo }}
                </span>
              </td>
              <td>{{ order.title }}</td>
              <td>{{ order.carInfo }}</td>
              <td *ngIf="!authService.isCustomer()">{{ order.customerName }}</td>
              <td>{{ order.technicianName || '-' }}</td>
              <td>
                <span class="badge status-{{ order.status?.toLowerCase() }}">
                  {{ OrderStatusLabels[order.status as OrderStatus] || order.status }}
                </span>
              </td>
              <td>{{ order.createdAt | date:'yyyy-MM-dd HH:mm' }}</td>
              <td>
                <div class="actions">
                  <button [routerLink]="['/orders', order.id]" class="btn btn-primary btn-sm btn-icon">
                    详情
                  </button>
                  <button 
                    *ngIf="canStartWork(order)" 
                    (click)="startWork(order)" 
                    class="btn btn-success btn-sm btn-icon"
                  >
                    开始
                  </button>
                  <button 
                    *ngIf="canCompleteWork(order)" 
                    (click)="completeWork(order)" 
                    class="btn btn-warning btn-sm btn-icon"
                  >
                    完成
                  </button>
                  <button 
                    *ngIf="canCancelOrder(order)" 
                    (click)="cancelOrder(order)" 
                    class="btn btn-danger btn-sm btn-icon"
                  >
                    取消
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <ng-template #noOrders>
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <div class="empty-state-title">暂无工单</div>
            <div class="empty-state-text" *ngIf="authService.isCustomer()">
              <button routerLink="/orders/create" class="btn btn-primary mt-3">立即预约服务</button>
            </div>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class OrderListComponent implements OnInit {
  orders: WorkOrder[] = [];
  displayOrders: WorkOrder[] = [];
  filterStatus: string = '';
  OrderStatus = OrderStatus;
  OrderStatusLabels = OrderStatusLabels;

  constructor(
    public authService: AuthService,
    private workOrderService: WorkOrderService
  ) {}

  get pageTitle(): string {
    if (this.authService.isAdmin()) return '工单管理';
    if (this.authService.isTechnician()) return '我的任务';
    return '我的工单';
  }

  get pageSubtitle(): string {
    if (this.authService.isAdmin()) return '管理所有维修保养工单';
    if (this.authService.isTechnician()) return '查看和处理分配给您的任务';
    return '查看您的维修保养预约记录';
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    if (this.authService.isAdmin()) {
      this.workOrderService.getAllOrders().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.orders = response.data;
            this.filterOrders();
          }
        }
      });
    } else {
      this.workOrderService.getMyOrders().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.orders = response.data;
            this.filterOrders();
          }
        }
      });
    }
  }

  filterOrders(): void {
    if (!this.filterStatus) {
      this.displayOrders = [...this.orders];
    } else {
      this.displayOrders = this.orders.filter(o => o.status === this.filterStatus);
    }
  }

  canStartWork(order: WorkOrder): boolean {
    return this.authService.isTechnician() && order.status === OrderStatus.ASSIGNED;
  }

  canCompleteWork(order: WorkOrder): boolean {
    return this.authService.isTechnician() && order.status === OrderStatus.IN_PROGRESS;
  }

  canCancelOrder(order: WorkOrder): boolean {
    return (this.authService.isCustomer() || this.authService.isAdmin()) && 
           order.status !== OrderStatus.COMPLETED && 
           order.status !== OrderStatus.CANCELLED;
  }

  startWork(order: WorkOrder): void {
    this.workOrderService.startWork(order.id!).subscribe({
      next: () => this.loadOrders()
    });
  }

  completeWork(order: WorkOrder): void {
    const remarks = prompt('请输入完成备注（可选）：');
    this.workOrderService.completeWork(order.id!, remarks || undefined).subscribe({
      next: () => this.loadOrders()
    });
  }

  cancelOrder(order: WorkOrder): void {
    const reason = prompt('请输入取消原因：');
    if (reason !== null) {
      this.workOrderService.cancelOrder(order.id!, reason || undefined).subscribe({
        next: () => this.loadOrders()
      });
    }
  }
}
