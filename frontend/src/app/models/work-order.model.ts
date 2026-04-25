export interface WorkOrder {
  id?: number;
  orderNo?: string;
  customerId?: number;
  customerName?: string;
  carId: number;
  carInfo?: string;
  technicianId?: number;
  technicianName?: string;
  orderType: OrderType;
  title: string;
  description?: string;
  status?: OrderStatus;
  priority?: Priority;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  actualDuration?: number;
  totalAmount?: number;
  remarks?: string;
  serviceItems?: OrderServiceItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  carId: number;
  orderType: OrderType;
  title: string;
  description?: string;
  priority?: Priority;
  appointmentDate?: string;
  remarks?: string;
  serviceItemIds?: number[];
}

export interface OrderServiceItem {
  id?: number;
  serviceItemId?: number;
  serviceName?: string;
  quantity?: number;
  unitPrice?: number;
  subtotal?: number;
  notes?: string;
}

export enum OrderType {
  MAINTENANCE = 'MAINTENANCE',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export const OrderTypeLabels: Record<OrderType, string> = {
  [OrderType.MAINTENANCE]: '保养',
  [OrderType.REPAIR]: '维修',
  [OrderType.INSPECTION]: '检测'
};

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '待分配',
  [OrderStatus.ASSIGNED]: '已分配',
  [OrderStatus.IN_PROGRESS]: '进行中',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消'
};

export const PriorityLabels: Record<Priority, string> = {
  [Priority.LOW]: '低',
  [Priority.MEDIUM]: '中',
  [Priority.HIGH]: '高',
  [Priority.URGENT]: '紧急'
};
