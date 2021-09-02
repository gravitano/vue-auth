import { LocalStorage } from "./local"
import { SecureLocalStorage } from "./secure-ls"
import { AuthStorage } from '../types/index'

export const drivers = {
  local: LocalStorage,
  secureLs: SecureLocalStorage
}

export const DEFAULT_DRIVER = 'secureLs'

export const storage: AuthStorage = new drivers[DEFAULT_DRIVER]