import type { BudgetData, Client, Material } from '../interfaces'
import type { IStorageService } from './storage.interface'
import { IdGenerator } from '../utils/idGenerator'

const STORAGE_KEYS = {
  CLIENTS: 'clients',
  BUDGETS: 'budgets',
  MATERIALS: 'materials'
} as const

export class LocalStorageService implements IStorageService {
  private getItem<T>(key: string): T[] {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : []
  }

  private setItem<T>(key: string, value: T[]): void {
    localStorage.setItem(key, JSON.stringify(value))
  }

  // Clientes
  async saveClient(client: Client): Promise<Client> {
    const clients = this.getItem<Client>(STORAGE_KEYS.CLIENTS)
    const newClient = {
      ...client,
      id: IdGenerator.getNextClientId(clients)
    }
    clients.push(newClient)
    this.setItem(STORAGE_KEYS.CLIENTS, clients)
    return newClient
  }

  async getClients(): Promise<Client[]> {
    return this.getItem<Client>(STORAGE_KEYS.CLIENTS)
  }

  async getClientByName(name: string): Promise<Client | null> {
    const clients = await this.getClients()
    return clients.find(c => c.name.toLowerCase() === name.toLowerCase()) || null
  }

  async updateClient(client: Client): Promise<Client> {
    const clients = this.getItem<Client>(STORAGE_KEYS.CLIENTS)
    const index = clients.findIndex(c => c.id === client.id)
    if (index !== -1) {
      clients[index] = client
      this.setItem(STORAGE_KEYS.CLIENTS, clients)
    }
    return client
  }

  async deleteClient(clientId: number): Promise<void> {
    const clients = this.getItem<Client>(STORAGE_KEYS.CLIENTS)
    const filteredClients = clients.filter(c => c.id !== clientId)
    this.setItem(STORAGE_KEYS.CLIENTS, filteredClients)
  }

  // Orçamentos
  async saveBudget(budget: BudgetData): Promise<BudgetData> {
    const budgets = this.getItem<BudgetData>(STORAGE_KEYS.BUDGETS)
    const newBudget = {
      ...budget,
      id: IdGenerator.getNextBudgetId(budgets)
    }
    budgets.push(newBudget)
    this.setItem(STORAGE_KEYS.BUDGETS, budgets)
    return newBudget
  }

  async saveBudgets(budgets: BudgetData[]): Promise<void> {
    this.setItem(STORAGE_KEYS.BUDGETS, budgets)
  }

  async getBudgets(): Promise<BudgetData[]> {
    return this.getItem<BudgetData>(STORAGE_KEYS.BUDGETS)
  }

  async updateBudget(budget: BudgetData): Promise<BudgetData> {
    const budgets = this.getItem<BudgetData>(STORAGE_KEYS.BUDGETS)
    const index = budgets.findIndex(b => b.id === budget.id)
    if (index !== -1) {
      budgets[index] = budget
      this.setItem(STORAGE_KEYS.BUDGETS, budgets)
    }
    return budget
  }

  async deleteBudget(budgetId: number): Promise<void> {
    const budgets = this.getItem<BudgetData>(STORAGE_KEYS.BUDGETS)
    const filteredBudgets = budgets.filter(b => b.id !== budgetId)
    this.setItem(STORAGE_KEYS.BUDGETS, filteredBudgets)
  }

  // Materiais
  async saveMaterial(material: Material): Promise<Material> {
    const materials = this.getItem<Material>(STORAGE_KEYS.MATERIALS)
    const newMaterial = {
      ...material,
      id: IdGenerator.getNextMaterialId(materials)
    }
    materials.push(newMaterial)
    this.setItem(STORAGE_KEYS.MATERIALS, materials)
    return newMaterial
  }

  async getMaterials(): Promise<Material[]> {
    return this.getItem<Material>(STORAGE_KEYS.MATERIALS)
  }

  async updateMaterial(materialId: number, updates: Partial<Material>): Promise<Material> {
    const materials = this.getItem<Material>(STORAGE_KEYS.MATERIALS)
    const index = materials.findIndex(m => m.id === materialId)
    if (index !== -1) {
      materials[index] = { ...materials[index], ...updates }
      this.setItem(STORAGE_KEYS.MATERIALS, materials)
    }
    return materials[index]
  }

  async deleteMaterial(materialId: number): Promise<void> {
    const materials = this.getItem<Material>(STORAGE_KEYS.MATERIALS)
    const filteredMaterials = materials.filter(m => m.id !== materialId)
    this.setItem(STORAGE_KEYS.MATERIALS, filteredMaterials)
  }
}

export const storageService = new LocalStorageService()
