<template>
  <div class="p-4">
    <div class="flex flex-col border border-surface-200 dark:border-surface-700 rounded">
      <h1 class="text-center text-2xl font-family text-gray-600/60 dark:text-gray-400 mt-2">Gerar Orçamento</h1>
      <Stepper v-model:value="currentStep">
        <StepItem value="1">
          <Step>Informações do Cliente</Step>
          <StepPanel v-slot="{ activateCallback }">
            <form @submit.prevent="(e) => onClientSubmit(e, activateCallback)" class="flex flex-col gap-2">
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
                <Button type="submit" label="Próximo" @click="activateCallback('2')" class="w-[210px]"
                  icon="pi pi-arrow-right" />
              </div>
            </form>
          </StepPanel>
        </StepItem>
        <StepItem value="2">
          <Step>Materiais</Step>
          <StepPanel v-slot="{ activateCallback }">
            <form @submit.prevent="(e) => onMaterialSubmit(e)" class="flex flex-col gap-2 mr-4">
              <FloatLabel variant="in">
                <InputText v-model="formData.product" />
                <label>Nome do Produto</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputText v-model="formData.brand" />
                <label>Marca do Produto</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputNumber v-model="formData.measure" inputId="measure" suffix="cm" />
                <label>Medida(cm)</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputNumber v-model="formData.unitPrice" mode="currency" currency="BRL" locale="pt-BR" />
                <label>Valor Unitário</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputText v-model="formData.quantity" type="number" />
                <label>Quantidade</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputNumber v-model="formData.totalPrice" mode="currency" currency="BRL" locale="pt-BR"
                  :minFractionDigits="2" :maxFractionDigits="2" :useGrouping="false" disabled />
                <label>Valor Total do Material</label>
              </FloatLabel>
              <div class="py-2 flex flex-col gap-4">
                <ConfirmDialog></ConfirmDialog>
                <Toast />
                <div class="flex gap-2">
                  <Button type="button" label="Voltar" @click="activateCallback('1')" />
                  <Button type="submit" label="Adicionar Material" />
                  <Button type="button" label="Proximo" @click="() => goToNextStep(activateCallback)" />
                </div>
              </div>
            </form>
          </StepPanel>
        </StepItem>
        <StepItem value="3">
          <Step>Lista de Materiais do orçamento</Step>
          <StepPanel v-slot="{ activateCallback }">
            <DataTable :value="budget.materials">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex flex-col gap-2">
                    <span class="text-lg font-bold opacity-60">Cliente: {{ clientName }}</span>
                    <span class="text-lg font-bold opacity-60">Empresa: {{ clientCompany }}</span>
                    <span class="text-lg font-bold opacity-60">Proposta: #{{ budget.id ||
                      nextBudgetId.toString().padStart(4, '0') }}</span>
                  </div>
                  <div class="flex justify-end gap-2">
                    <Button icon="pi pi-check" @click="() => saveBudget(activateCallback)" severity="success" />
                  </div>
                </div>
              </template>
              <Column class="!text-center" field="name" header="Produto"></Column>
              <Column class="!text-center" field="quantity" header="Quantidade"></Column>
              <Column class="!text-center" field="unit" header="Unidade"></Column>
              <Column class="!text-center" field="price" header="Valor Unitário">
                <template #body="slotProps">
                  {{ formatCurrency(slotProps.data.price) }}
                </template>
              </Column>
              <Column class="!text-center" field="total" header="Valor Total">
                <template #body="slotProps">
                  {{ formatCurrency(slotProps.data.total) }}
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
              <span class="text-xl font-bold mr-4">Total: {{ formatCurrency(budget.total) }}</span>
            </div>

          </StepPanel>
        </StepItem>
      </Stepper>
    </div>
  </div>

  <!-- Ajustar o Dialog para ser responsivo -->
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
          <span class="ml-2">{{ budget.materials.length }}</span>
        </div>
        <div class="text-base md:text-lg">
          <span class="font-semibold">Valor Total:</span>
          <span class="ml-2 text-green-600 font-bold">{{ formatCurrency(budget.total) }}</span>
        </div>
      </div>
    </div>
    <div class="flex flex-col md:flex-row justify-end items-center text-center self-center gap-2 p-4 md:p-6">
      <Button label="Criar Novo Orçamento" icon="pi pi-plus" @click="() => { resetForm(); currentStep = '1'; }"
        class="w-full md:w-auto" outlined />
      <Button label="Ver Listaa de Orçamentos" icon="pi pi-list" @click="router.push('/orcamentos')"
        class="w-full md:w-auto" />
    </div>

  </Dialog>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storageService } from '../services/localStorage.service'
import type { BudgetData, Client, Material } from '../interfaces'
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
import { useBudgetStore } from '../stores/budgetStore'

import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"

const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const budgetStore = useBudgetStore()


const clientName = ref('')
const clientCompany = ref('')
const clientWhatsapp = ref('')
const filteredClients = ref<Client[]>([])
const loading = ref(false)
const showSuccessDialog = ref(false)
const isDuplicating = ref(false)
const currentStep = ref('1')
const nextBudgetId = ref('0000')


interface MaterialFormData {
  product: string
  brand: string
  measure: number
  unitPrice: number
  quantity: string
  totalPrice: number
}

const formData = ref<MaterialFormData>({
  product: '',
  brand: '',
  measure: 0,
  unitPrice: 0,
  quantity: '',
  totalPrice: 0
})

const budget = ref<BudgetData>({
  id: 0,
  client: {
    id: 0,
    name: '',
    company: '',
    whatsapp: ''
  },
  materials: [],
  total: 0,
  status: 'Pendente',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})


const getNextBudgetId = async () => {
  const existingBudgets = await storageService.getBudgets()
  const maxId = Math.max(...existingBudgets.map(b => b.id), 0)
  nextBudgetId.value = (maxId + 1).toString().padStart(4, '0')
}

onMounted(getNextBudgetId)

watchEffect(() => {
  const unitPrice = formData.value.unitPrice
  const quantity = Number(formData.value.quantity)

  if (!isNaN(quantity) && quantity > 0) {
    formData.value.totalPrice = unitPrice * quantity
  } else {
    formData.value.totalPrice = 0
  }
})

const searchClients = async (event: { query: string }) => {
  if (event.query.length > 0) {
    const clients = await storageService.getClients()
    filteredClients.value = clients.filter(client =>
      client.name.toLowerCase().includes(event.query.toLowerCase())
    )
  } else {
    filteredClients.value = []
  }
}

const onClientSelect = (event: AutoCompleteOptionSelectEvent) => {
  const client = event.value as Client
  clientName.value = client.name
  clientCompany.value = client.company
  clientWhatsapp.value = client.whatsapp
  filteredClients.value = []
}

const handleAddMaterial = async (formData: MaterialFormData) => {
  confirm.require({
    message: 'Deseja adicionar o material?',
    header: 'Confirmar',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sim',
    rejectLabel: 'Não',
    accept: async () => {
      try {
        const material: Material = {
          id: 0,
          name: formData.product,
          brand: formData.brand,
          quantity: Number(formData.quantity),
          unit: 'cm',
          price: formData.unitPrice,
          total: formData.totalPrice
        }

        await budgetStore.addMaterial(material)
        budget.value.materials.push(material)
        calculateMaterialTotal(material)

        // Limpa o formulário
        formData.product = ''
        formData.brand = ''
        formData.measure = 0
        formData.unitPrice = 0
        formData.quantity = ''
        formData.totalPrice = 0

        toast.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Material adicionado com sucesso',
          life: 3000
        })
      } catch (error) {
        console.error('Erro ao adicionar material:', error)
        toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao adicionar material. Tente novamente.',
          life: 3000
        })
      }
    }
  })
}

const calculateMaterialTotal = (material: Material) => {
  material.total = material.quantity * material.price
  budget.value.total = budget.value.materials.reduce((sum, m) => sum + m.total, 0)
}

const handleDeleteMaterial = (id: string) => {
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
        await budgetStore.deleteMaterial(id)
      } catch (error) {
        console.error('Erro ao excluir material:', error)
      }
    }
  })
}

const checkDuplicateBudget = async () => {
  const existingBudgets = await storageService.getBudgets()
  return existingBudgets.find(b =>
    b.client.name === budget.value.client.name &&
    b.client.company === budget.value.client.company &&
    b.materials.length === budget.value.materials.length &&
    b.total === budget.value.total &&
    JSON.stringify(b.materials.map(m => ({ ...m, id: 0 })).sort()) ===
    JSON.stringify(budget.value.materials.map(m => ({ ...m, id: 0 })).sort())
  )
}

const confirmDuplication = (activateCallback: (step: string) => void) => {
  confirm.require({
    message: 'Um orçamento idêntico já existe. Deseja criar uma duplicata?',
    header: 'Orçamento Duplicado',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sim, Duplicar',
    rejectLabel: 'Não, Cancelar',
    accept: async () => {
      isDuplicating.value = true
      await saveBudgetToStorage()
      showSuccessDialog.value = true
    },
    reject: () => {
      toast.add({
        severity: 'info',
        summary: 'Cancelado',
        detail: 'Operação cancelada pelo usuário',
        life: 3000,
      })
      resetForm()
      goToStep(activateCallback, '1')
    }
  })
}

const saveBudgetToStorage = async () => {
  const existingBudgets = await storageService.getBudgets()
  const maxId = Math.max(...existingBudgets.map(b => b.id), 0)
  budget.value.id = maxId + 1
  existingBudgets.unshift(budget.value)
  await storageService.saveBudgets(existingBudgets)
}

const resetForm = () => {
  clientName.value = ''
  clientCompany.value = ''
  clientWhatsapp.value = ''
  budget.value = {
    id: 0,
    client: {
      id: 0,
      name: '',
      company: '',
      whatsapp: ''
    },
    materials: [],
    total: 0,
    status: 'Pendente',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  showSuccessDialog.value = false
  isDuplicating.value = false
  currentStep.value = '1'
}

const saveBudget = async (activateCallback: (step: string) => void) => {
  try {
    if (!clientName.value || !clientCompany.value || !clientWhatsapp.value) {
      toast.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Por favor, preencha todos os campos antes de salvar o orçamento.',
        life: 3000
      })
      return
    }

    if (budget.value.materials.length === 0) {
      toast.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Adicione pelo menos um material ao orçamento.',
        life: 3000
      })
      return
    }

    loading.value = true

    // Busca todos os clientes para verificar se já existe
    const allClients = await storageService.getClients()
    const existingClient = allClients.find(c =>
      c.name === clientName.value &&
      c.company === clientCompany.value &&
      c.whatsapp === clientWhatsapp.value
    )

    let savedClient: Client
    if (existingClient) {
      savedClient = await storageService.updateClient(existingClient)
    } else {
      const newClient: Client = {
        id: 0,
        name: clientName.value,
        company: clientCompany.value,
        whatsapp: clientWhatsapp.value
      }
      savedClient = await storageService.saveClient(newClient)
    }

    budget.value.client = savedClient
    budget.value.total = budget.value.materials.reduce((sum, material) => sum + material.total, 0)

    // Verifica se já existe um orçamento idêntico
    if (!isDuplicating.value && await checkDuplicateBudget()) {
      confirmDuplication(activateCallback)
      return
    }

    // Se não for duplicado ou se já confirmou a duplicação, salva
    await saveBudgetToStorage()
    showSuccessDialog.value = true

  } catch (error) {
    console.error('Erro ao salvar orçamento:', error)
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro ao gerar orçamento. Tente novamente.',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const onClientSubmit = (event: Event, callback: (step: string) => void) => {
  event.preventDefault()
  if (clientName.value && clientCompany.value && clientWhatsapp.value) {
    callback('2')
  }
}

const onMaterialSubmit = (event: Event) => {
  event.preventDefault()
  if (formData.value.product && formData.value.brand && formData.value.measure && formData.value.unitPrice > 0 && formData.value.quantity) {
    handleAddMaterial(formData.value as MaterialFormData)
  }
}

const goToNextStep = (activateCallback: (step: string) => void) => {
  if (budget.value.materials.length === 0) {
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

const goToStep = (activateCallback: (step: string) => void, step: string) => {
  currentStep.value = step
  activateCallback(step)
}

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
