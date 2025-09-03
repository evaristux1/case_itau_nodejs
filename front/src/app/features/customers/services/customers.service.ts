// features/customers/services/customers.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../enviroments/enviroments';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  CreateCustomerDto,
  Customer,
  TransactionResponse,
  UpdateCustomerDto,
} from '../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/clientes`;

  getCustomers(): Observable<Customer[]> {
    return this.http
      .get<ApiResponse<Customer[]>>(this.baseUrl)
      .pipe(map((response) => response.data));
  }

  getCustomer(id: number): Observable<Customer> {
    return this.http
      .get<ApiResponse<Customer>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  createCustomer(customer: CreateCustomerDto): Observable<Customer> {
    return this.http
      .post<ApiResponse<Customer>>(this.baseUrl, customer)
      .pipe(map((response) => response.data));
  }

  updateCustomer(
    id: number,
    customer: UpdateCustomerDto
  ): Observable<Customer> {
    return this.http
      .put<ApiResponse<Customer>>(`${this.baseUrl}/${id}`, customer)
      .pipe(map((response) => response.data));
  }

  deposit(
    customerId: number,
    amount: string,
    idempotencyKey?: string
  ): Observable<TransactionResponse> {
    const headers = new HttpHeaders(
      idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    );

    return this.http
      .post<ApiResponse<TransactionResponse>>(
        `${this.baseUrl}/${customerId}/depositar`,
        { amount },
        { headers }
      )
      .pipe(map((response) => response.data));
  }

  withdraw(
    customerId: number,
    amount: string,
    idempotencyKey?: string
  ): Observable<TransactionResponse> {
    const headers = new HttpHeaders(
      idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    );

    return this.http
      .post<ApiResponse<TransactionResponse>>(
        `${this.baseUrl}/${customerId}/sacar`,
        { amount },
        { headers }
      )
      .pipe(map((response) => response.data));
  }
}
