<template>
  <div class="p-4">
    <div class="flex flex-col border border-surface-200 dark:border-surface-700 rounded">
      <h1 class="text-center text-2xl font-family text-gray-600/60 dark:text-gray-400 mt-2">Gerar Orçamento</h1>
      <Stepper>
        <StepItem value="1">
          <Step>Informações do Cliente</Step>
          <StepPanel v-slot="{ activateCallback }">
            <div class="flex flex-col gap-2">
              <FloatLabel variant="in">
                <InputText v-model="currentBudget.client.clientName" />
                <label>Nome do cliente</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputText v-model="currentBudget.client.clientCompany" />
                <label>Empresa do cliente</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputText type="number" />
                <label>Contato (Whatsapp)</label>
              </FloatLabel>
            </div>
            <div class="py-6">
              <Button label="Próximo" @click="activateCallback('2')" class="w-[210px]" icon="pi pi-arrow-right" />
            </div>
          </StepPanel>
        </StepItem>
        <StepItem value="2">
          <Step>Materiais</Step>
          <StepPanel v-slot="{ activateCallback }">
            <div class="flex flex-col gap-2 mr-4">
              <FloatLabel variant="in">
                <InputText v-model="formData.product" />
                <label>Produto</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputText v-model="formData.brand" />
                <label>Marca do Produto</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputText v-model="formData.measure" type="number" />
                <label>Medida(cm)</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputText v-model="formData.unitPrice" type="number" />
                <label>Valor Unitário</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputText v-model="formData.quantity" type="number" />
                <label>Quantidade</label>
              </FloatLabel>
              <FloatLabel variant="in">
                <InputText v-model="formData.totalPrice" disabled />
                <label>Valor Total do Material</label>
              </FloatLabel>
            </div>
            <div class="py-2 flex flex-col gap-4">
              <ConfirmDialog></ConfirmDialog>
              <Toast />
              <Button @click="confirmAddMaterial" label="Adicionar Material" class="w-[210px]"></Button>
              <Button @click="activateCallback('3')" label="Próximo" class="w-[210px]"
                icon="pi pi-arrow-right"></Button>
            </div>
          </StepPanel>
        </StepItem>
        <StepItem value="3">
          <Step>Lista de Materiais do orçamento</Step>
          <StepPanel class="!p-4 rounded-lg">
            <DataTable :value="currentBudget.materials">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex flex-col gap-2">
                    <span class="text-lg font-bold opacity-60">Cliente: {{ currentBudget.client.clientName }}</span>
                    <span class="text-lg font-bold opacity-60">Empresa: {{ currentBudget.client.clientCompany }}</span>
                    <span class="text-lg font-bold opacity-60">Proposta: #0001</span>
                  </div>
                  <div class="flex justify-end gap-2">
                    <Button icon="pi pi-check" @click="generateBudget" severity="success" />
                  </div>
                </div>
              </template>
              <Column class="!text-center" field="product" header="Produto"></Column>
              <Column class="!text-center" field="brand" header="Marca"></Column>
              <Column class="!text-center" field="measure" header="Medida"></Column>
              <Column class="!text-center" field="unitPrice" header="Valor Unitário"></Column>
              <Column class="!text-center" field="quantity" header="Quantidade"></Column>
              <Column class="!text-center" field="totalPrice" header="Valor Total">
                <template #body="slotProps">
                  R$ {{ slotProps.data.totalPrice }}
                </template>
              </Column>
              <Column class="!text-center" header="Ações">
                <template #body="slotProps">
                  <Button icon="pi pi-trash" severity="danger" text @click="confirmDelete(slotProps.data)" />
                </template>
              </Column>
            </DataTable>
          </StepPanel>
        </StepItem>
      </Stepper>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Stepper from 'primevue/stepper'
import StepItem from 'primevue/stepitem'
import Step from 'primevue/step'
import StepPanel from 'primevue/steppanel'
import FloatLabel from 'primevue/floatlabel'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'

import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"
import { type Budget, type BudgetData } from '../interfaces'

const confirm = useConfirm()
const toast = useToast()
const router = useRouter()

const formData = ref<Budget>({
  id: "",
  product: "",
  brand: "",
  measure: "",
  unitPrice: "",
  quantity: "",
  totalPrice: "",

})

const currentBudget = ref<BudgetData>({
  id: "",
  createdAt: "",
  client: {
    clientName: "",
    clientCompany: ""
  },
  materials: [],
  status: "Pendente",
  totalValue: 0
})

const allBudgets = ref<BudgetData[]>([])

let nextId = 1

watchEffect(() => {
  const unitPrice = Number(formData.value.unitPrice)
  const quantity = Number(formData.value.quantity)

  if (!isNaN(unitPrice) && !isNaN(quantity) && unitPrice > 0 && quantity > 0) {
    formData.value.totalPrice = (unitPrice * quantity).toFixed(2)
  } else {
    formData.value.totalPrice = ''
  }
})

const addMaterial = () => {
  if (formData.value.product && formData.value.brand && formData.value.measure && formData.value.unitPrice && formData.value.quantity) {
    currentBudget.value.materials.push({
      id: String(nextId++),
      product: formData.value.product,
      brand: formData.value.brand,
      measure: formData.value.measure,
      unitPrice: formData.value.unitPrice,
      quantity: formData.value.quantity,
      totalPrice: formData.value.totalPrice,
    })

    formData.value.product = ''
    formData.value.brand = ''
    formData.value.measure = ''
    formData.value.unitPrice = ''
    formData.value.quantity = ''
    formData.value.totalPrice = ''
    return true
  } else {
    alert('Por favor, preencha todos os campos antes de adicionar.')
    return false
  }
}

const confirmAddMaterial = () => {
  confirm.require({
    message: 'Deseja adicionar o material?',
    header: 'Confirmar',
    rejectProps: {
      label: 'Cancelar',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Sim',
    },
    accept: () => {
      if (addMaterial()) {
        toast.add({ severity: 'success', summary: 'Confirmação', detail: 'Material adicionado com sucesso', life: 3000 })
      }
    },
    reject: () => {
      toast.add({ severity: 'error', summary: 'Rejeitado', detail: 'Material não adicionado', life: 3000 })
    }
  })
}

const generateBudget = () => {
  if (currentBudget.value.client.clientName && currentBudget.value.client.clientCompany && currentBudget.value.materials.length > 0) {
    const budgetToSave = {
      ...currentBudget.value,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      totalValue: currentBudget.value.materials.reduce((acc, material) => acc + Number(material.totalPrice), 0)
    }
    allBudgets.value.push(budgetToSave)
    saveBudgetsToLocalStorage()
    currentBudget.value = {
      id: "",
      createdAt: "",
      status: "Pendente",
      client: {
        clientName: "",
        clientCompany: ""
      },
      materials: [],
      totalValue: 0
    }
    nextId = 1
    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Orçamento gerado com sucesso!',
      life: 3000
    })
    router.push('/')
    return true
  }
  return false
}

const confirmDelete = (material: Budget) => {
  confirm.require({
    message: 'Deseja excluir o material?',
    header: 'Confirmar',
    rejectProps: {
      label: 'Cancelar',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'SIM',
    },
    accept: () => {
      currentBudget.value.materials = currentBudget.value.materials.filter(m => m.id !== material.id)
      toast.add({ severity: 'success', summary: 'Confirmação', detail: 'Material excluído com sucesso', life: 3000 })
    },
    reject: () => {
      toast.add({ severity: 'error', summary: 'Rejeitado', detail: 'Material não excluído', life: 3000 })
    }
  })
}

const saveBudgetsToLocalStorage = () => {
  localStorage.setItem('budgets', JSON.stringify(allBudgets.value))
}

onMounted(() => {
  const savedBudgets = localStorage.getItem('budgets')
  if (savedBudgets) {
    allBudgets.value = JSON.parse(savedBudgets)
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