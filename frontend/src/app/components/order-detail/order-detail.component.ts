import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkOrderService } from '../../services/work-order.service';
import { ServiceItemService } from '../../services/service-item.service';
import { AuthService } from '../../services/auth.service';
import { WorkOrder, OrderStatus, OrderStatusLabels, OrderType, OrderTypeLabels, Priority, PriorityLabels } from '../../models/work-order.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-order-detail',
  template: `
    <ng-container *ngIf="order; else loading">
      <div class="page-header d-flex justify-between align-center">
        <div>
          <h1 class="page-title">工单详情</h1>
          <p class="page-subtitle">工单编号：{{ order.orderNo }}</p>
        </div>
        <button routerLink="/orders" class="btn btn-secondary">
          返回列表
        </button>
      </div>

      <div class="card">
        <div class="card-header d-flex justify-between align-center">
          <h3 class="card-title">{{ order.title }}</h3>
          <span class="badge status-{{ order.status?.toLowerCase() }}">
            {{ OrderStatusLabels[order.status as OrderStatus] }}
          </span>
        </div>
        <div class="card-body">
          <div class="form-row">
            <div class="flex-1">
              <div class="detail-row">
                <span class="detail-label">工单类型</span>
                <span class="detail-value">{{ OrderTypeLabels[order.orderType as OrderType] }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">优先级</span>
                <span class="detail-value">
                  <span class="badge priority-{{ order.priority?.toLowerCase() }}">
                    {{ PriorityLabels[order.priority as Priority] }}
                  </span>
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">预约时间</span>
                <span class="detail-value">{{ order.appointmentDate | date:'yyyy-MM-dd HH:mm' || '-' }}</span>
              </div>
            </div>
            <div class="flex-1">
              <div class="detail-row">
                <span class="detail-label">客户</span>
                <span class="detail-value">{{ order.customerName }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">车辆</span>
                <span class="detail-value">{{ order.carInfo }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">技师</span>
                <span class="detail-value">{{ order.technicianName || '待分配' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-row mt-3">
            <span class="detail-label">问题描述</span>
            <span class="detail-value">{{ order.description || '无' }}</span>
          </div>

          <div class="detail-row" *ngIf="order.remarks">
            <span class="detail-label">备注</span>
            <span class="detail-value">{{ order.remarks }}</span>
          </div>

          <div class="form-row mt-3">
            <div class="flex-1">
              <div class="detail-row">
                <span class="detail-label">创建时间</span>
                <span class="detail-value">{{ order.createdAt | date:'yyyy-MM-dd HH:mm' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">开始时间</span>
                <span class="detail-value">{{ order.startTime | date:'yyyy-MM-dd HH:mm' || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">完成时间</span>
                <span class="detail-value">{{ order.endTime | date:'yyyy-MM-dd HH:mm' || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">实际工时</span>
                <span class="detail-value">{{ order.actualDuration ? order.actualDuration + ' 分钟' : '-' }}</span>
              </div>
            </div>
            <div class="flex-1">
              <div class="detail-row">
                <span class="detail-label">服务项目</span>
                <span class="detail-value">
                  <div *ngIf="order.serviceItems && order.serviceItems.length > 0; else noItems">
                    <div *ngFor="let item of order.serviceItems" class="mb-1">
                      {{ item.serviceName }} - ¥{{ item.subtotal }}
                    </div>
                  </div>
                  <ng-template #noItems>-</ng-template>
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">总金额</span>
                <span class="detail-value" style="font-weight: 600; color: var(--color-accent);">
                  ¥{{ order.totalAmount }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-4" *ngIf="showAssignSection">
        <div class="card-header">
          <h3 class="card-title">指派技师</h3>
        </div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">选择技师</label>
              <div class="select-wrapper">
                <select [(ngModel)]="selectedTechnicianId" class="form-control">
                  <option [value]="null">请选择技师</option>
                  <option *ngFor="let tech of technicians" [value]="tech.id">
                    {{ tech.realName }} ({{ tech.phone }})
                  </option>
                </select>
              </div>
            </div>
            <div class="form-group" style="align-self: flex-end;">
              <button 
                class="btn btn-primary btn-lg" 
                [disabled]="!selectedTechnicianId"
                (click)="assignTechnician()"
              >
                确认指派
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-4">
        <div class="card-header">
          <h3 class="card-title">操作</h3>
        </div>
        <div class="card-body">
          <div class="actions">
            <button 
              *ngIf="canStartWork" 
              (click)="startWork()" 
              class="btn btn-success btn-lg"
            >
              开始维修保养
            </button>
            <button 
              *ngIf="canCompleteWork" 
              (click)="completeWork()" 
              class="btn btn-warning btn-lg"
            >
              完成工单
            </button>
            <button 
              *ngIf="canCancelOrder" 
              (click)="cancelOrder()" 
              class="btn btn-danger btn-lg"
            >
              取消工单
            </button>
          </div>
        </div>
      </div>
    </ng-container>

    <ng-template #loading>
      <div class="text-center mt-4">
        <div class="loading" style="width: 40px; height: 40px;"></div>
        <p class="mt-2 text-muted">加载中...</p>
      </div>
    </ng-template>
  `
})
export class OrderDetailComponent implements OnInit {
  order!: WorkOrder | null;
  technicians: User[] = [];
  selectedTechnicianId: number | null = null;
  OrderStatus = OrderStatus;
  OrderStatusLabels = OrderStatusLabels;
  OrderType = OrderType;
  OrderTypeLabels = OrderTypeLabels;
  Priority = Priority;
  PriorityLabels = PriorityLabels;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workOrderService: WorkOrderService,
    private serviceItemService: ServiceItemService,
    public authService: AuthService
  ) {}

  get showAssignSection(): boolean {
    return this.authService.isAdmin() && 
           this.order?.status === OrderStatus.PENDING;
  }

  get canStartWork(): boolean {
    return this.authService.isTechnician() && 
           this.order?.status === OrderStatus.ASSIGNED;
  }

  get canCompleteWork(): boolean {
    return this.authService.isTechnician() && 
           this.order?.status === OrderStatus.IN_PROGRESS;
  }

  get canCancelOrder(): boolean {
    return (this.authService.isCustomer() || this.authService.isAdmin()) && 
           this.order?.status !== OrderStatus.COMPLETED && 
           this.order?.status !== OrderStatus.CANCELLED;
  }

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('id'));
    if (orderId) {
      this.loadOrder(orderId);
      this.loadTechnicians();
    }
  }

  loadOrder(id: number): void {
    this.workOrderService.getOrderById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.order = response.data;
        }
      }
    });
  }

  loadTechnicians(): void {
    if (this.authService.isAdmin()) {
      this.serviceItemService.getAllTechnicians().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.technicians = response.data;
          }
        }
      });
    }
  }

  assignTechnician(): void {
    if (this.selectedTechnicianId && this.order?.id) {
      this.workOrderService.assignTechnician(this.order.id, this.selectedTechnicianId).subscribe({
        next: () => {
          this.loadOrder(this.order!.id!);
        }
      });
    }
  }

  startWork(): void {
    if (this.order?.id) {
      this.workOrderService.startWork(this.order.id).subscribe({
        next: () => this.loadOrder(this.order!.id!)
      });
    }
  }

  completeWork(): void {
    const remarks = prompt('请输入完成备注（可选）：');
    if (this.order?.id) {
      this.workOrderService.completeWork(this.order.id, remarks || undefined).subscribe({
        next: () => this.loadOrder(this.order!.id!)
      });
    }
  }

  cancelOrder(): void {
    const reason = prompt('请输入取消原因：');
    if (reason !== null && this.order?.id) {
      this.workOrderService.cancelOrder(this.order.id, reason || undefined).subscribe({
        next: () => this.loadOrder(this.order!.id!)
      });
    }
  }
}
