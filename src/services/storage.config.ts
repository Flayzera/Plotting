import { LocalStorageService } from './localStorage.service'
import type { IStorageService } from './storage.interface'

// Aqui podemos facilmente trocar a implementação do serviço de armazenamento
// quando decidirmos migrar para o Supabase
export const storageService: IStorageService = new LocalStorageService()
