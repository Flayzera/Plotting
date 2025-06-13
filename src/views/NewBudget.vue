<template>
  <div class="p-4">
    <div class="flex flex-col border border-surface-200 dark:border-surface-700 rounded">
      <div class="flex flex-row items-center">
        <Button icon="pi pi-arrow-left" @click="router.push('/orcamentos')" variant="text" class="ml-1" />
        <h1 class="flex-1 text-center text-2xl font-family text-gray-600/60 dark:text-gray-400 mt-2">Gerar Orçamento
        </h1>
      </div>

      <Stepper v-model:value="currentStep">
        <StepItem value="1">
          <Step>Informações do Cliente</Step>
          <StepPanel v-slot="{ activateCallback }">
            <div class="flex flex-col gap-2">
              <FloatLabel variant="in">
                <AutoComplete :loading="loading" v-model="clientName" :suggestions="filteredClients"
                  @complete="searchClients" @item-select="onClientSelect" optionLabel="name" />
                <label>Nome do cliente</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputText v-model="clientCompany" />
                <label>Empresa do cliente</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputText v-model="clientWhatsapp" />
                <label>Contato (Whatsapp)</label>
              </FloatLabel>
              <div class="py-6">
                <Button type="button" label="Próximo"
                  @click="() => { if (clientName && clientCompany && clientWhatsapp) { activateCallback('2') } }"
                  class="w-[210px]" icon="pi pi-arrow-right" />
              </div>
            </div>
          </StepPanel>
        </StepItem>

        <StepItem value="2">
          <Step>Materiais</Step>
          <StepPanel v-slot="{ activateCallback }">
            <div class="flex flex-col gap-2 mr-4">
              <FloatLabel variant="in">
                <InputText v-model="materialForm.name" />
                <label>Nome do Produto</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputText v-model="materialForm.brand" />
                <label>Marca do Produto</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputText v-model="materialForm.unit" suffix="cm" />
                <label>Unidade de Medida</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputNumber v-model="materialForm.quantity" inputId="quantity" />
                <label>Quantidade</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputNumber v-model="materialForm.price" mode="currency" currency="BRL" locale="pt-BR" />
                <label>Valor Unitário</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputNumber v-model="materialForm.total" mode="currency" currency="BRL" locale="pt-BR" disabled />
                <label>Valor Total do Material</label>
              </FloatLabel>
              <div class="py-2 flex flex-col gap-4">
                <ConfirmDialog></ConfirmDialog>
                <Toast />
                <div class="flex gap-2">
                  <Button type="button" label="Voltar" @click="activateCallback('1')" />
                  <Button type="button" label="Adicionar Material" @click="handleAddMaterial" />
                  <Button type="button" label="Proximo" @click="() => goToNextStep(activateCallback)" />
                </div>
              </div>
            </div>
          </StepPanel>
        </StepItem>

        <StepItem value="3">
          <Step>Lista de Materiais do orçamento</Step>
          <StepPanel v-slot="{ activateCallback }">
            <DataTable :value="budget.items">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex flex-col gap-2">
                    <span class="text-lg font-bold opacity-60">Cliente: {{ clientName }}</span>
                    <span class="text-lg font-bold opacity-60">Empresa: {{ clientCompany }}</span>
                    <span class="text-lg font-bold opacity-60">Proposta: #{{ budget.id ||
                      nextBudgetId.toString().padStart(4, '0') }}</span>
                  </div>
                  <div class="flex justify-end gap-2">
                    <Button icon="pi pi-check" @click="() => saveBudget()" severity="success" />
                  </div>
                </div>
              </template>
              <Column class="!text-center" field="description" header="Produto"></Column>
              <Column class="!text-center" field="quantity" header="Quantidade"></Column>
              <Column class="!text-center" field="unit" header="Unidade"></Column>
              <Column class="!text-center" field="unitPrice" header="Valor Unitário">
                <template #body="slotProps">
                  {{ formatService.currency(slotProps.data.unitPrice) }}
                </template>
              </Column>
              <Column class="!text-center" field="total" header="Valor Total">
                <template #body="slotProps">
                  {{ formatService.currency(slotProps.data.total) }}
                </template>
              </Column>
              <Column class="!text-center" header="Ações">
                <template #body="slotProps">
                  <Button icon="pi pi-trash" severity="danger" text @click="handleDeleteMaterial(slotProps.data.id)" />
                </template>
              </Column>
            </DataTable>
            <div class="flex justify-between my-4">
              <Button type="button" label="Voltar" @click="activateCallback('2')" />
              <span class="text-xl font-bold mr-4">Total: {{ formatService.currency(budget.total) }}</span>
            </div>

          </StepPanel>
        </StepItem>
      </Stepper>
    </div>
  </div>

  <Dialog v-model:visible="showSuccessDialog" :modal="true" class="w-full md:w-[90%] lg:w-[70%] xl:w-[50%] mx-auto">
    <template #header>
      <div class="flex items-center gap-2">
        <i class="pi pi-check-circle text-green-500 text-xl md:text-2xl"></i>
        <span class="font-bold text-xl md:text-lg">Orçamento Gerado com Sucesso!</span>
      </div>
    </template>

    <div class="flex flex-col gap-4 p-4 md:p-6">
      <div class="flex flex-col gap-3">
        <div class="text-base md:text-lg">
          <span class="font-semibold">Número:</span>
          <span class="ml-2">#{{ budget.id || nextBudgetId }}</span>
        </div>

        <div class="text-base md:text-lg">
          <span class="font-semibold">Cliente:</span>
          <span class="ml-2">{{ budget.client.name }}</span>
        </div>

        <div class="text-base md:text-lg">
          <span class="font-semibold">Empresa:</span>
          <span class="ml-2">{{ budget.client.company }}</span>
        </div>

        <div class="text-base md:text-lg">
          <span class="font-semibold">Total de Materiais:</span>
          <span class="ml-2">{{ budget.items.length }}</span>
        </div>

        <div class="text-base md:text-lg">
          <span class="font-semibold">Valor Total:</span>
          <span class="ml-2 text-green-600 font-bold">{{ formatService.currency(budget.total) }}</span>
        </div>
      </div>
    </div>

    <div class="flex flex-col md:flex-row justify-end items-center text-center self-center gap-2 p-4 md:p-6">
      <Button label="Criar Novo Orçamento" icon="pi pi-plus" @click="() => { resetForm(); currentStep = '1'; }"
        class="w-full md:w-auto" outlined />

      <Button label="Ver Lista de Orçamentos" icon="pi pi-list" @click="router.push('/orcamentos')"
        class="w-full md:w-auto" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBudgetStore } from '../stores/budgetStore'
import { useClientStore } from '../stores/clientStore'
import { formatService } from '../services/format'
import type { BudgetData, Client, BudgetItem } from '../interfaces'
import type { AutoCompleteOptionSelectEvent } from 'primevue/autocomplete'

import InputText from 'primevue/inputtext'
import AutoComplete from 'primevue/autocomplete'
import FloatLabel from 'primevue/floatlabel'
import Button from 'primevue/button'
import Stepper from 'primevue/stepper'
import StepItem from 'primevue/stepitem'
import Step from 'primevue/step'
import StepPanel from 'primevue/steppanel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import InputNumber from 'primevue/inputnumber'
import Dialog from 'primevue/dialog'

import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const budgetStore = useBudgetStore()
const clientStore = useClientStore()

const clientName = ref('')
const clientCompany = ref('')
const clientWhatsapp = ref('')
const filteredClients = ref<Client[]>([])
const loading = ref(false)
const showSuccessDialog = ref(false)
const isDuplicating = ref(false)
const currentStep = ref('1')
const nextBudgetId = ref('0000')

const selectedClient = ref<Client | null>(null)

const materialForm = ref({
  name: '',
  brand: '',
  quantity: 0,
  unit: 'cm',
  price: 0,
  total: 0
})

const budget = ref<BudgetData>({
  id: 0,
  number: '',
  client: {
    name: '',
    company: '',
    phone: ''
  },
  items: [],
  subtotal: 0,
  total: 0,
  status: 'Pendente',
  createdBy: 0,
  validUntil: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
})

const getNextBudgetId = async () => {
  const existingBudgets = budgetStore.budgets
  const maxId = Math.max(...existingBudgets.map((b: BudgetData) => b.id), 0)
  nextBudgetId.value = (maxId + 1).toString().padStart(4, '0')
}

const searchClients = async (event: { query: string }) => {
  if (event.query.length > 0) {
    loading.value = true
    try {
      const clients = await clientStore.searchClients(event.query)
      filteredClients.value = clients
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      toast.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao buscar clientes. Tente novamente.',
        life: 3000
      })
    } finally {
      loading.value = false
    }
  } else {
    filteredClients.value = []
  }
}

const onClientSelect = (event: AutoCompleteOptionSelectEvent) => {
  const client = event.value as Client
  selectedClient.value = client
  clientName.value = client.name
  clientCompany.value = client.company
  clientWhatsapp.value = client.phone
}

const handleAddMaterial = () => {
  if (!materialForm.value.name || !materialForm.value.quantity || !materialForm.value.price) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Preencha todos os campos do material',
      life: 3000
    })
    return
  }

  confirm.require({
    message: 'Tem certeza que deseja adicionar este material ao orçamento?',
    header: 'Confirmar Adição',
    icon: 'pi pi-question-circle',
    acceptProps: {
      label: 'Sim',
      severity: 'success',
    },
    rejectProps: {
      label: 'Não',
      severity: 'secondary',
    },
    accept: () => {
      const item: BudgetItem = {
        id: Date.now(),
        description: materialForm.value.name,
        quantity: materialForm.value.quantity,
        unit: materialForm.value.unit,
        unitPrice: materialForm.value.price,
        total: materialForm.value.quantity * materialForm.value.price
      }

      budget.value.items.push(item)
      budget.value.total = budget.value.items.reduce((sum, m) => sum + m.total, 0)

      toast.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Material adicionado com sucesso!',
        life: 3000
      })

      // Reset form
      materialForm.value = {
        name: '',
        brand: '',
        quantity: 0,
        unit: 'cm',
        price: 0,
        total: 0
      }
    }
  })
}

const handleDeleteMaterial = (id: number) => {
  confirm.require({
    message: 'Tem certeza que deseja excluir este material?',
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
        budget.value.items = budget.value.items.filter(item => item.id !== id)
        budget.value.total = budget.value.items.reduce((sum, m) => sum + m.total, 0)
        toast.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Material excluído com sucesso!',
          life: 3000
        })
      } catch (error) {
        console.error('Erro ao excluir material:', error)
        toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao excluir material. Tente novamente.',
          life: 3000
        })
      }
    }
  })
}

const resetForm = () => {
  clientName.value = ''
  clientCompany.value = ''
  clientWhatsapp.value = ''
  budget.value = {
    id: 0,
    number: '',
    client: {
      name: '',
      company: '',
      phone: ''
    },
    items: [],
    subtotal: 0,
    total: 0,
    status: 'Pendente',
    createdBy: 0,
    validUntil: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
  showSuccessDialog.value = false
  isDuplicating.value = false
  currentStep.value = '1'
}

const saveBudget = async () => {
  try {
    if (!clientName.value || !clientCompany.value || !clientWhatsapp.value) {
      toast.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos do cliente.', life: 3000 })
      return
    }
    if (!budget.value.items || budget.value.items.length === 0) {
      toast.add({ severity: 'error', summary: 'Erro', detail: 'Adicione pelo menos um material.', life: 3000 })
      return
    }
    loading.value = true
    let clientId: number

    // Se não tiver um cliente selecionado, primeiro busca se existe
    if (!selectedClient.value) {
      const existingClients = await clientStore.searchClients(clientName.value)
      const existingClient = existingClients.find(c =>
        c.name.toLowerCase() === clientName.value.toLowerCase() ||
        c.company.toLowerCase() === clientCompany.value.toLowerCase()
      )

      if (existingClient) {
        clientId = existingClient.id
      } else {
        // Só cria se realmente não existir
        const newClient = await clientStore.createClient({
          name: clientName.value,
          company: clientCompany.value,
          phone: clientWhatsapp.value,
          createdBy: 1
        })
        clientId = newClient.id
      }
    } else {
      clientId = selectedClient.value.id
    }

    const budgetData = {
      clientId,
      items: Array.isArray(budget.value.items) ? budget.value.items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        total: item.total
      })) : [],
      total: budget.value.total,
      pdfData: `budget_${Date.now()}.pdf`,
      status: 'Pendente' as const
    }

    const response = await budgetStore.createBudget(budgetData)
    // Atualiza o budget com os dados retornados e adiciona o cliente
    budget.value = {
      ...response,
      client: {
        name: clientName.value,
        company: clientCompany.value,
        phone: clientWhatsapp.value
      }
    }
    showSuccessDialog.value = true
  } catch (error) {
    console.error('Erro ao salvar orçamento:', error)
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao gerar orçamento. Tente novamente.', life: 3000 })
  } finally {
    loading.value = false
  }
}

const goToNextStep = (activateCallback: (step: string) => void) => {
  if (budget.value.items.length === 0) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Adicione pelo menos um material antes de prosseguir.',
      life: 3000
    })
    return
  }
  activateCallback('3')
}

onMounted(getNextBudgetId)

watchEffect(() => {
  if (materialForm.value.quantity && materialForm.value.price) {
    materialForm.value.total = materialForm.value.quantity * materialForm.value.price
  }
})
</script>

<style scoped>
:deep(.p-steppanel) {
  background: none
}

.p-stepitem:last-of-type .p-steppanel {
  padding-inline-start: 0;
}

:deep(.p-steppanel-content) {
  margin-inline-start: 0 !important;
}

:deep(.p-stepper-separator) {
  margin-right: 8px !important;
}

:deep(.p-datatable-column-header-content) {
  justify-content: center !important;
}
</style>
