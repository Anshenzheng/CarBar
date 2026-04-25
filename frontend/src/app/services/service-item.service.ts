import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceItem, ServiceCategory } from '../models/service-item.model';
import { ApiResponse } from '../models/user.model';

const API_URL = 'http://localhost:8080/api';

@Injectable({
  providedIn: 'root'
})
export class ServiceItemService {

  constructor(private http: HttpClient) { }

  getAllServices(): Observable<ApiResponse<ServiceItem[]>> {
    return this.http.get<ApiResponse<ServiceItem[]>>(`${API_URL}/public/services`);
  }

  getServicesByCategory(category: ServiceCategory): Observable<ApiResponse<ServiceItem[]>> {
    return this.http.get<ApiResponse<ServiceItem[]>>(`${API_URL}/public/services/category/${category}`);
  }

  getAllTechnicians(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${API_URL}/admin/technicians`);
  }
}
