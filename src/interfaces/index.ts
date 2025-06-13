export type BudgetStatus = 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Concluido';

export interface Client {
  id: number;
  name: string;
  company: string;
  phone: string;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Material {
  id: number;
  name: string;
  brand: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export interface BudgetData {
  id: number;
  number: string;
  client: {
    name: string;
    company: string;
    phone: string;
  };
  items: BudgetItem[];
  subtotal: number;
  total: number;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Concluido';
  createdBy: number;
  pdfUrl?: string;
  notes?: string;
  validUntil: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: number;
  email: string;
}

export interface BudgetItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  total: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}




