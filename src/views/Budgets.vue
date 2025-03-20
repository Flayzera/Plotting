<template>
  <div class="p-4">
    <div class="flex justify-between mb-10">
      <h1 class="text-4xl font-bold">Orçamentos</h1>
      <Button icon="pi pi-plus" label="Novo Orçamento" @click="navigateToNew" severity="success" />
    </div>
    <div class="text-base mb-4 uppercase">
      <Tag value="Orçamentos Pendentes" severity="warn" />
    </div>
    <DataTable :value="budgets" stripedRows paginator :rows="5">
      <Column header=" Proposta" />
      <Column field="client.clientName" header="Cliente" />
      <Column field="createdAt" header="Data Criação">
        <template #body="{ data }">
          {{ new Date(data.createdAt).toLocaleDateString('pt-BR') }}
        </template>
      </Column>
      <Column field="totalValue" header="Valor Total">
        <template #body="{ data }">
          {{ formatCurrency(data.totalValue) }}
        </template>
      </Column>
      <Column field="status" header="Status">
        <template #body="{ data }">
          <Tag :value="data.status"
            :severity="data.status === 'Pendente' ? 'warn' : data.status === 'Aprovado' ? 'success' : data.status === 'Rejeitado' ? 'danger' : '{{ data.status }}'" />
        </template>
      </Column>
      <Column header="Ações">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button icon="pi pi-eye" severity="info" @click="viewBudget(data.id)" tooltip="Ver Orçamento" rounded
              text />
            <Button icon="pi pi-file" severity="success" @click="generatePDF(data.id)" tooltip="Gerar PDF" rounded
              text />
            <Button icon="pi pi-trash" severity="danger" @click="confirmDelete(data.id)" tooltip="Excluir" rounded
              text />
            <Select v-model="data.status" :options="statusOptions" optionLabel="name" optionValue="code" />

          </div>
        </template>
      </Column>
      <template #footer>
        <div class="flex justify-end">
          <p>Total de Orçamentos: {{ budgets.length }}</p>
        </div>
      </template>
    </DataTable>
    <ConfirmDialog />
    <Toast />
  </div>
</template>

<script setup>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const budgets = ref([])

const statusOptions = ref([
  { name: 'Pendente', code: 'Pendente' },
  { name: 'Aprovado', code: 'Aprovado' },
  { name: 'Concluido', code: 'Concluido' },
  { name: 'Rejeitado', code: 'Rejeitado' },

]);


const navigateToNew = () => {
  router.push('/novo-orcamento')
}


const loadBudgets = () => {
  const savedBudgets = localStorage.getItem('budgets')
  if (savedBudgets) {
    budgets.value = JSON.parse(savedBudgets)
  }
}

const confirmDelete = (id) => {
  confirm.require({
    message: 'Tem certeza que deseja excluir este orçamento?',
    header: 'Confirmar Exclusão',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteBudget(id)
  })
}

const deleteBudget = (id) => {
  budgets.value = budgets.value.filter(budget => budget.id !== id)
  localStorage.setItem('budgets', JSON.stringify(budgets.value))
  toast.add({
    severity: 'success',
    summary: 'Sucesso',
    detail: 'Orçamento excluído com sucesso!',
    life: 3000
  })
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

onMounted(() => {
  loadBudgets()
})
</script>
