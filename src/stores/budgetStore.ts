import { defineStore } from 'pinia'

import type { BudgetData, BudgetItem } from '../interfaces'
import { budgetRules } from '../validations/budgetRules'
import { budgets } from '../services/api'

interface BudgetState {
  budgets: BudgetData[];
  currentBudget: BudgetData | null;
  loading: boolean;
  error: string | null;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export const useBudgetStore = defineStore('budget', {
  state: (): BudgetState => ({
    budgets: [],
    currentBudget: null,
    loading: false,
    error: null,
  }),

  getters: {
    getBudgetById: (state) => (id: number) => {
      return state.budgets.find((budget: BudgetData) => budget.id === id);
    },
  },

  actions: {
    async fetchBudgets() {
      this.loading = true;
      this.error = null;
      try {
        const response = await budgets.getAll();
        this.budgets = response.map(budget => ({
          ...budget,
          status: budget.status || 'Pendente'
        }));
        return this.budgets;
      } catch (error: unknown) {
        const apiError = error as ApiError;
        this.error = apiError.response?.data?.error || 'Error fetching budgets';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchBudgetById(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const budget = await budgets.getById(id.toString());
        this.currentBudget = budget;
        return this.currentBudget;
      } catch (error: unknown) {
        const apiError = error as ApiError;
        this.error = apiError.response?.data?.error || 'Error fetching budget';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createBudget(data: {
      clientId: number;
      items: BudgetItem[];
      total: number;
      pdfData: string;
      status: BudgetData['status'];
    }) {
      this.loading = true;
      this.error = null;
      try {
        const budget = await budgets.create(data);
        this.budgets.push(budget);
        return budget;
      } catch (error: unknown) {
        const apiError = error as ApiError;
        this.error = apiError.response?.data?.error || 'Error creating budget';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateBudget(id: number, budgetData: Partial<BudgetData>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedBudget = await budgets.update(id.toString(), budgetData);
        const index = this.budgets.findIndex((b: BudgetData) => b.id === id);
        if (index !== -1) {
          this.budgets[index] = updatedBudget;
        }
        if (this.currentBudget?.id === id) {
          this.currentBudget = updatedBudget;
        }
        return updatedBudget;
      } catch (error: unknown) {
        const apiError = error as ApiError;
        this.error = apiError.response?.data?.error || 'Error updating budget';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteBudget(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await budgets.delete(id.toString());
        this.budgets = this.budgets.filter((b: BudgetData) => b.id !== id);
        if (this.currentBudget?.id === id) {
          this.currentBudget = null;
        }
      } catch (error: unknown) {
        const apiError = error as ApiError;
        this.error = apiError.response?.data?.error || 'Error deleting budget';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearCurrentBudget() {
      this.currentBudget = null;
    },

    nextProposalNumber() {
      const lastBudget = this.budgets[this.budgets.length - 1]
      if (!lastBudget) return '0001'

      const lastNumber = parseInt(lastBudget.id.toString())
      return String(lastNumber + 1).padStart(4, '0')
    },

    validateBudget(budget: BudgetData): string[] {
      return budgetRules.budget.validate(budget)
    },

    async addBudget(data: { clientId: number; items: BudgetItem[]; total: number; pdfData: string }) {
      try {
        const newBudget = await budgets.create(data)
        this.budgets.push(newBudget)
        return newBudget;
      } catch (error) {
        console.error('Error adding budget:', error);
        throw error;
      }
    },

    async updateMaterial(id: number, updates: Partial<BudgetItem>) {
      try {
        if (!this.currentBudget) return;
        const index = this.currentBudget.items.findIndex(m => m.description === updates.description)
        if (index !== -1) {
          this.currentBudget.items[index] = { ...this.currentBudget.items[index], ...updates }
        }
        return this.currentBudget.items[index]
      } catch (error) {
        console.error('Error updating material:', error)
        throw error
      }
    },

    resetCurrentBudget() {
      this.currentBudget = {
        id: 0,
        number: '',
        status: 'Pendente',
        client: {
          name: '',
          company: '',
          phone: '',
        },
        items: [],
        subtotal: 0,
        total: 0,
        createdBy: 0,
        validUntil: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },

    async addItem(item: BudgetItem) {
      try {
        if (!this.currentBudget) return;
        this.currentBudget.items.push(item)
      } catch (error) {
        console.error('Error adding item:', error)
        throw error
      }
    },
  }
})
