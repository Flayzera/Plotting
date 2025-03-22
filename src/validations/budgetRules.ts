import type { BudgetData, Material, Client } from '../interfaces'

export const budgetRules = {
  client: {
    validate: (client: Client): string[] => {
      const errors: string[] = []

      if (!client.name?.trim()) {
        errors.push('Nome do cliente é obrigatório')
      }

      if (!client.company?.trim()) {
        errors.push('Empresa do cliente é obrigatória')
      }

      if (!client.whatsapp?.trim()) {
        errors.push('WhatsApp é obrigatório')
      } else if (!/^(\+55|55)?(\d{2})(\d{5})(\d{4})$/.test(client.whatsapp.replace(/\D/g, ''))) {
        errors.push('Número de WhatsApp inválido')
      }

      return errors
    },

    formatWhatsapp: (whatsapp: string): string => {
      const cleaned = whatsapp.replace(/\D/g, '')
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
  },

  material: {
    validate: (material: Material): string[] => {
      const errors: string[] = []

      if (!material.name?.trim()) {
        errors.push('Produto é obrigatório')
      }

      if (!material.brand?.trim()) {
        errors.push('Marca é obrigatória')
      }

      if (!material.quantity || material.quantity <= 0) {
        errors.push('Quantidade deve ser maior que zero')
      }

      if (!material.unit || material.unit.trim() === '') {
        errors.push('Unidade de medida é obrigatória')
      }

      if (!material.price || material.price <= 0) {
        errors.push('Valor total deve ser maior que zero')
      }

      return errors
    },

    calculateTotalPrice: (unitPrice: number, quantity: number): number => {
      return unitPrice * quantity
    }
  },

  budget: {
    validate: (budget: BudgetData): string[] => {
      const errors: string[] = []

      const clientErrors = budgetRules.client.validate(budget.client)
      errors.push(...clientErrors)

      if (!budget.materials?.length) {
        errors.push('Adicione pelo menos um material')
      } else {
        budget.materials.forEach((material, index) => {
          const materialErrors = budgetRules.material.validate(material)
          materialErrors.forEach(error => {
            errors.push(`Material ${index + 1}: ${error}`)
          })
        })
      }

      return errors
    }
  },

  format: {
    currency: (value: number): string => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    }
  }
}
