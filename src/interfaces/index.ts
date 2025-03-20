export type BudgetStatus = 'Pendente' | 'Aprovado' | 'Rejeitado'

export interface Client {
  clientName: string
  clientCompany: string
}

export interface Material {
  id: string
  product: string
  brand: string
  measure: string
  unitPrice: string
  quantity: string
  totalPrice: string
}

export interface Budget {
  id: string
  product: string
  brand: string
  measure: string
  unitPrice: string
  quantity: string
  totalPrice: string
}

export interface BudgetData {
  id: string
  createdAt: string
  status: BudgetStatus
  client: Client
  materials: Material[]
  totalValue: number
}



