<template>
  <div class="p-3">
    <div class="flex flex-col border border-surface-200 dark:border-surface-700 rounded">
      <div class="flex flex-row items-center p-2 border-b border-surface-200 dark:border-surface-700">
        <Button icon="pi pi-arrow-left" @click="router.push('/orcamentos')" variant="text" />
        <h1 class="flex-1 text-2xl font-bold text-center">Visualização do Orçamento</h1>
        <Button v-if="budget" icon="pi pi-print" @click="showPrintDialog = true" variant="text" />
      </div>

      <div v-if="loading" class="flex justify-center items-center p-8">
        <ProgressSpinner />
      </div>

      <div v-else-if="budget" class="p-4">
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-4">Informações do Cliente</h2>
          <div class="flex flex-wrap">
            <div class="flex flex-col gap-2 w-full md:w-1/2 md:pr-2 mb-4">
              <span class="text-gray-600 dark:text-gray-400">Nome:</span>
              <span class="font-medium">{{ budget.client.name }}</span>
            </div>

            <div class="flex flex-col gap-2 w-full md:w-1/2 md:pl-2 mb-4">
              <span class="text-gray-600 dark:text-gray-400">Empresa:</span>
              <span class="font-medium">{{ budget.client.company }}</span>
            </div>

            <div class="flex flex-col gap-2 w-full md:w-1/2 md:pr-2 mb-4">
              <span class="text-gray-600 dark:text-gray-400">Telefone:</span>
              <span class="font-medium">{{ budget.client.phone }}</span>
            </div>

            <div class="flex flex-col gap-2 w-full md:w-1/2 md:pl-2 mb-4">
              <span class="text-gray-600 dark:text-gray-400">Status:</span>
              <div class="w-fit">
                <Tag :value="budget.status" :severity="getStatusSeverity(budget.status)" />
              </div>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-4">Materiais</h2>
          <DataTable :value="budget.items" class="p-datatable-sm">
            <Column class="text-center" field="description" header="Produto"></Column>
            <Column class="text-center" field="quantity" header="Quantidade"></Column>
            <Column class="text-center" field="unitPrice" header="Valor Unitário">
              <template #body="{ data }">
                {{ formatService.currency(data.unitPrice) }}
              </template>
            </Column>
            <Column class="text-center" field="total" header="Total">
              <template #body="{ data }">
                {{ formatService.currency(data.total) }}
              </template>
            </Column>
          </DataTable>
        </div>

        <div
          class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-surface-100 dark:bg-surface-800 rounded">
          <div class="flex flex-col gap-2">
            <span class="text-gray-600 dark:text-gray-400">Número do Orçamento:</span>
            <span class="font-medium">#{{ budget.number }}</span>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-gray-600 dark:text-gray-400">Data de Criação:</span>
            <span class="font-medium">{{ formatService.date(budget.createdAt) }}</span>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-gray-600 dark:text-gray-400">Última Atualização:</span>
            <span class="font-medium">{{ formatService.date(budget.updatedAt) }}</span>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-gray-600 dark:text-gray-400">Valor Total:</span>
            <span class="font-bold text-xl text-green-600">{{ formatService.currency(budget.total) }}</span>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center p-8">
        <i class="pi pi-exclamation-circle text-4xl text-red-500 mb-4"></i>
        <h2 class="text-xl font-semibold mb-2">Orçamento não encontrado</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">O orçamento que você está procurando não existe ou foi
          removido.</p>
        <Button label="Voltar para Lista" icon="pi pi-arrow-left" @click="router.push('/orcamentos')" />
      </div>
    </div>
  </div>

  <Dialog v-model:visible="showPrintDialog" modal :style="{ width: '80vw' }">
    <template #header>
      <div class="flex items-center gap-2">
        <i class="pi pi-print text-xl"></i>
        <span>Visualização de Impressão</span>
      </div>
    </template>

    <!-- Layout de Impressão -->
    <PrintLayout v-if="budget" ref="printRef" :budget="budget" />

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" @click="showPrintDialog = false" text />
        <Button label="Gerar PDF" icon="pi pi-file-pdf" @click="savePDF" severity="primary" />
      </div>
    </template>
  </Dialog>

  <Toast />
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, createApp } from 'vue'
import { useBudgetStore } from '../stores/budgetStore'
import { formatService } from '../services/format'
import { pdfService } from '../services/pdf'
import type { BudgetData } from '../interfaces'
import type { PrintLayoutInstance } from '../interfaces/print'

import PrintLayout from '../components/PrintLayout.vue'

import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const budgetStore = useBudgetStore()

const budget = ref<BudgetData | null>(null)
const loading = ref(true)
const showPrintDialog = ref(false)
const printRef = ref<PrintLayoutInstance | null>(null)

const getStatusSeverity = (status: BudgetData['status']) => {
  switch (status) {
    case 'Pendente':
      return 'warn'
    case 'Aprovado':
      return 'info'
    case 'Rejeitado':
      return 'danger'
    case 'Concluido':
      return 'success'
    default:
      return 'info'
  }
}


const savePDF = async () => {
  try {
    if (!budget.value) {
      throw new Error('Orçamento não encontrado')
    }

    // Criar um elemento temporário para o layout de impressão
    const printElement = document.createElement('div')
    printElement.className = 'print-layout'

    // Criar uma instância do Vue para renderizar o componente
    const app = createApp(PrintLayout, { budget: budget.value })
    app.mount(printElement)

    // Aguardar um momento para garantir que o componente foi renderizado
    await new Promise(resolve => setTimeout(resolve, 100))

    // Gerar o PDF
    await pdfService.generatePDF(
      printElement,
      `orcamento-${budget.value.number}.pdf`
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

onMounted(async () => {
  try {
    const id = parseInt(route.params.id as string)
    const fetchedBudget = await budgetStore.fetchBudgetById(id)
    if (!fetchedBudget) {
      throw new Error('Orçamento não encontrado')
    }
    budget.value = {
      ...fetchedBudget,
      client: fetchedBudget.client || {
        name: '',
        company: '',
        phone: ''
      },
      items: fetchedBudget.items || []
    }
  } catch (error) {
    console.error('Erro ao carregar orçamento:', error)
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro ao carregar orçamento. Tente novamente.',
      life: 3000
    })
    budget.value = null
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.print-layout {
  background: white;
  color: black;
  padding: 0;
  width: 210mm;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px;
  margin-bottom: 20px;
}

.logo {
  height: 64px;
  width: auto;
}

.header-right {
  text-align: right;
}

.title {
  font-size: 36px;
  font-weight: bold;
  margin: 0;
  color: #90291c;
}

.subtitle {
  font-size: 14px;
  margin: 0;
  color: #e32021;
}

.info-section {
  background-color: #F07E66;
  padding: 20px 40px;
  width: 100%;
}

.info-container {
  display: flex;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.info-left,
.info-right {
  flex: 1;
}

.info-left p {
  color: white;
  margin: 4px 0;
}

.info-left .bold {
  font-size: 20px;
  font-weight: bold;
}

.info-right {
  text-align: right;
  color: white;
}

.info-right p {
  margin: 4px 0;
}

.bold {
  font-weight: bold;
}

.table-header {
  width: 100%;
}

.table-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border-collapse: collapse;
}

.table-container th,
.table-container td {
  padding: 12px 20px;
  text-align: center;
  color: white;
}

.table-container th {
  font-weight: bold;
  background-color: #FF2A23;
}

.table-container tbody {
  background-color: #8D2A24;
}

.table-container tbody tr {
  border-bottom: 1px solid #ffffff29;
}

.table-container tbody tr:last-child {
  border-bottom: none;
}

.footer {
  display: flex;
  justify-content: space-between;
  padding: 20px 40px;
  margin-top: 64px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.footer-right {
  text-align: right;
}

.footer p {
  margin: 8px 0;
}

.footer-text {
  color: #991b1b;
  font-size: 18px;
}

.footer-total {
  color: #991b1b;
  font-size: 18px;
  font-weight: bold;
}


.signature {
  display: flex;
  justify-content: center;
  margin-top: 64px;
  padding: 0 40px 40px;
}

.signature-line {
  width: 300px;
  text-align: center;
  border-top: 1px solid #ccc;
  padding-top: 8px;
}

.signature-line p {
  margin: 4px 0;
}

@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
