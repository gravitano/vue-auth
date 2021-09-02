import { AuthStorage } from '../../types/index';

export class LocalStorage implements AuthStorage {
  set(key: string, value: any) {
    localStorage.setItem(key, value);
  }

  get(key: string, defaultValue: any) {
    try {
      const token = localStorage.getItem(key)

      console.log(token)

      return token
    } catch {
      return defaultValue
    }
  }

  remove(key: string) {
    localStorage.remove(key);
  }

  clear() {
    localStorage.clear()
  }
}
