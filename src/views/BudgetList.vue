<template>
  <div class="p-4">
    <div class="flex justify-between mb-10">
      <h1 class="text-4xl font-bold">Orçamentos</h1>
      <Button @click="navigateToNew" label=" Novo Orçamento" class="!hidden md:!block" />
      <Button @click="navigateToNew" icon="pi pi-plus" class="!block md:!hidden" />
    </div>

    <div v-for="status in statusOptions" :key="status.code" class="mb-8">
      <div class="text-base mb-4 uppercase">
        <Tag :value="status.name" :severity="getStatusSeverity(status.code)" />
      </div>

      <DataTable :value="getBudgetsByStatus(status.code)" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        :rowHover="true" dataKey="id">

        <Column header="Proposta" bodyStyle="text-align: center">
          <template #body="{ data }">
            #{{ data.id.toString().padStart(4, '0') }}
          </template>
        </Column>

        <Column field="client.name" header="Cliente" bodyStyle="text-align: center" />

        <Column field="createdAt" header="Data Criação" bodyStyle="text-align: center">
          <template #body="{ data }">
            {{ formatService.date(data.createdAt) }}
          </template>
        </Column>

        <Column field="total" header="Valor Total" bodyStyle="text-align: center">
          <template #body="{ data }">
            {{ formatCurrency(data.total) }}
          </template>
        </Column>

        <Column header="Ações" bodyStyle="text-align: center">
          <template #body="{ data }">
            <Button icon="pi pi-eye" severity="info" tooltip="Ver Orçamento" rounded text
              @click="navigateToBudget(data.id)" />
            <Button icon="pi pi-file" severity="success" tooltip="Gerar PDF" @click="generatePDF(data)" rounded text />
            <Button icon="pi pi-trash" severity="danger" @click="handleDeleteBudget(data.id)" tooltip="Excluir" rounded
              text />
          </template>
        </Column>

        <Column field="status" header="Status" bodyStyle="text-align: center">
          <template #body="{ data }">
            <Dropdown v-model="data.status" :options="statusOptions" optionLabel="name" optionValue="code"
              @change="(e) => handleStatusChange(data.id, e.value)" />
          </template>
        </Column>

        <template #expansion="slotProps">
          <div class="p-3">
            <h5 class="text-lg font-semibold mb-3">Detalhes do Orçamento</h5>
            <DataTable :value="slotProps.data.materials" class="mb-4">
              <Column field="name" header="Produto"></Column>
              <Column field="brand" header="Marca"></Column>
              <Column field="quantity" header="Quantidade"></Column>
              <Column field="unit" header="Unidade">
                <template #body="{ data }">
                  {{ data.unit }}
                </template>
              </Column>
              <Column field="price" header="Valor Unitário">
                <template #body="{ data }">
                  {{ formatCurrency(data.price) }}
                </template>
              </Column>
              <Column field="total" header="Total">
                <template #body="{ data }">
                  {{ formatCurrency(data.total) }}
                </template>
              </Column>
            </DataTable>
          </div>
        </template>

        <template #footer>
          <div class="flex justify-end font-bold">
            <span>Total: {{ formatCurrency(getTotalValueByStatus(status.code)) }}</span>
          </div>
        </template>

        <template #empty>
          <div class="flex justify-center my-5 uppercase font-xl opacity-50">
            <h1 class="text-primary-default">Nenhum orçamento {{ status.name }} encontrado</h1>
          </div>
        </template>
      </DataTable>
    </div>
  </div>

  <ConfirmDialog />
  <Toast />
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

import { ref, onMounted, createApp } from 'vue'
import { useRouter } from 'vue-router'


import { useBudgetStore } from '../stores/budgetStore'
import type { BudgetData } from '../interfaces'

import { pdfService } from '../services/pdf'
import { formatService } from '../services/format'

import PrintLayout from '../components/PrintLayout.vue'

const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const budgetStore = useBudgetStore()

const statusOptions = ref([
  { name: 'Pendente', code: 'Pendente' as BudgetData['status'] },
  { name: 'Aprovado', code: 'Aprovado' as BudgetData['status'] },
  { name: 'Rejeitado', code: 'Rejeitado' as BudgetData['status'] },
  { name: 'Concluido', code: 'Concluido' as BudgetData['status'] },
])

// Removido: Estado local desnecessário para controlar status

const navigateToNew = () => {
  router.push('/novo-orcamento')
}

const handleStatusChange = async (budgetId: number, newStatus: BudgetData['status']) => {
  try {
    // Primeiro atualiza no backend
    await budgetStore.updateBudget(budgetId, { status: newStatus })

    // Atualiza o store local de forma imutável
    budgetStore.budgets = budgetStore.budgets.map(budget =>
      budget.id === budgetId
        ? { ...budget, status: newStatus }
        : budget
    )

    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Status atualizado com sucesso!',
      life: 3000
    })
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    // Em caso de erro, recarrega os orçamentos para garantir consistência
    await budgetStore.fetchBudgets()
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro ao atualizar status. Tente novamente.',
      life: 3000
    })
  }
}

const generatePDF = async (budget: BudgetData) => {
  try {
    // Ensure we have the complete budget data with client
    const completeBudget = await budgetStore.fetchBudgetById(budget.id);

    // Criar um elemento temporário para o layout de impressão
    const printElement = document.createElement('div')
    printElement.className = 'print-layout'

    // Criar uma instância do Vue para renderizar o componente
    const app = createApp(PrintLayout, { budget: completeBudget })
    app.mount(printElement)

    // Aguardar um momento para garantir que o componente foi renderizado
    await new Promise(resolve => setTimeout(resolve, 100))

    // Gerar o PDF
    await pdfService.generatePDF(
      printElement,
      `orcamento-${budget.id.toString().padStart(4, '0')}.pdf`
    )

    // Limpar
    app.unmount()

    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'PDF gerado com sucesso!',
      life: 3000
    })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro ao gerar o PDF',
      life: 3000
    })
  }
}

const navigateToBudget = (id: string) => {
  router.push(`/orcamento/${id}`)
}

const handleDeleteBudget = (id: number) => {
  confirm.require({
    message: 'Tem certeza que deseja excluir este orçamento?',
    header: 'Confirmar Exclusão',
    icon: 'pi pi-exclamation-triangle',
    acceptProps: {
      label: 'Sim',
      severity: 'danger',
    },
    rejectProps: {
      label: 'Não',
      severity: 'secondary',
    },
    accept: async () => {
      try {
        await budgetStore.deleteBudget(id)
        toast.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Orçamento excluído com sucesso!',
          life: 3000
        })
      } catch (error) {
        console.error('Erro ao excluir orçamento:', error)
        toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao excluir orçamento. Tente novamente.',
          life: 3000
        })
      }
    }
  })
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const getBudgetsByStatus = (status: BudgetData['status']) => {
  return budgetStore.budgets
    .filter(b => b.status === status)
    .map(budget => ({ ...budget })) // Cria uma cópia de cada orçamento
}

const getTotalValueByStatus = (status: BudgetData['status']) => {
  return getBudgetsByStatus(status).reduce((sum, budget) => sum + budget.total, 0)
}

const getStatusSeverity = (status: BudgetData['status']) => {
  switch (status) {
    case 'Pendente':
      return 'warn'
    case 'Aprovado':
      return 'info'
    case 'Concluido':
      return 'success'
    case 'Rejeitado':
      return 'danger'
    default:
      return 'info'
  }
}

onMounted(async () => {
  try {
    console.log('Fetching budgets...')
    await budgetStore.fetchBudgets()
    console.log('Budgets fetched:', budgetStore.budgets)
  } catch (error) {
    console.error('Error fetching budgets:', error)
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro ao carregar orçamentos. Tente novamente.',
      life: 3000
    })
  }
})
</script>

<style scoped>
:deep(.p-datatable-column-header-content) {
  justify-content: center !important;
}
</style>
