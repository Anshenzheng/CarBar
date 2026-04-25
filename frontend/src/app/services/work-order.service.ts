import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkOrder, CreateOrderRequest, OrderStatus } from '../models/work-order.model';
import { ApiResponse } from '../models/user.model';

const API_URL = 'http://localhost:8080/api';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderService {

  constructor(private http: HttpClient) { }

  getMyOrders(): Observable<ApiResponse<WorkOrder[]>> {
    return this.http.get<ApiResponse<WorkOrder[]>>(`${API_URL}/orders/my`);
  }

  getOrderById(id: number): Observable<ApiResponse<WorkOrder>> {
    return this.http.get<ApiResponse<WorkOrder>>(`${API_URL}/orders/${id}`);
  }

  getOrdersByStatus(status: OrderStatus): Observable<ApiResponse<WorkOrder[]>> {
    return this.http.get<ApiResponse<WorkOrder[]>>(`${API_URL}/orders/status/${status}`);
  }

  getAllOrders(): Observable<ApiResponse<WorkOrder[]>> {
    return this.http.get<ApiResponse<WorkOrder[]>>(`${API_URL}/admin/orders`);
  }

  createOrder(order: CreateOrderRequest): Observable<ApiResponse<WorkOrder>> {
    return this.http.post<ApiResponse<WorkOrder>>(`${API_URL}/customer/orders`, order);
  }

  assignTechnician(orderId: number, technicianId: number): Observable<ApiResponse<WorkOrder>> {
    return this.http.put<ApiResponse<WorkOrder>>(
      `${API_URL}/admin/orders/${orderId}/assign/${technicianId}`, {}
    );
  }

  startWork(orderId: number): Observable<ApiResponse<WorkOrder>> {
    return this.http.put<ApiResponse<WorkOrder>>(`${API_URL}/technician/orders/${orderId}/start`, {});
  }

  completeWork(orderId: number, remarks?: string): Observable<ApiResponse<WorkOrder>> {
    return this.http.put<ApiResponse<WorkOrder>>(
      `${API_URL}/technician/orders/${orderId}/complete`,
      remarks || {}
    );
  }

  cancelOrder(orderId: number, reason?: string): Observable<ApiResponse<WorkOrder>> {
    return this.http.put<ApiResponse<WorkOrder>>(
      `${API_URL}/orders/${orderId}/cancel`,
      reason || {}
    );
  }
}
