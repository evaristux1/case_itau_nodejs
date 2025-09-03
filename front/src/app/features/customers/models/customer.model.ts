export interface Customer {
  id: number;
  name: string;
  email: string;
  document: string;
  balanceCents: number;
  version: number;
  status: string;
  createdAt: string;
  deletedAt?: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  document: string;
  password: string;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
}

export interface TransactionRequest {
  amount: string;
}

export interface TransactionResponse {
  id: number;
  balanceCents: number;
  version: number;
}
