import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Car } from '../models/car.model';
import { ApiResponse } from '../models/user.model';

const API_URL = 'http://localhost:8080/api';

@Injectable({
  providedIn: 'root'
})
export class CarService {

  constructor(private http: HttpClient) { }

  getMyCars(): Observable<ApiResponse<Car[]>> {
    return this.http.get<ApiResponse<Car[]>>(`${API_URL}/customer/cars`);
  }

  getCarById(id: number): Observable<ApiResponse<Car>> {
    return this.http.get<ApiResponse<Car>>(`${API_URL}/cars/${id}`);
  }

  createCar(car: Car): Observable<ApiResponse<Car>> {
    return this.http.post<ApiResponse<Car>>(`${API_URL}/customer/cars`, car);
  }

  updateCar(id: number, car: Partial<Car>): Observable<ApiResponse<Car>> {
    return this.http.put<ApiResponse<Car>>(`${API_URL}/customer/cars/${id}`, car);
  }

  deleteCar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${API_URL}/customer/cars/${id}`);
  }

  getCarsByCustomer(customerId: number): Observable<ApiResponse<Car[]>> {
    return this.http.get<ApiResponse<Car[]>>(`${API_URL}/admin/cars/customer/${customerId}`);
  }
}
