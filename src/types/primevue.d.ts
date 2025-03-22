declare module 'primevue/form' {
  import { DefineComponent } from 'vue'
  const Form: DefineComponent<{
    resolver?: ObjectSchema<Record<string, unknown>> | ((values: Record<string, unknown>) => Promise<Record<string, unknown>>)
    initialValues?: Record<string, unknown>
    onSubmit?: (event: { valid: boolean; data: Record<string, unknown> }) => void
  }>
  export default Form
}
