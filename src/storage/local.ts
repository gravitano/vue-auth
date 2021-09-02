import { AuthStorage } from '../../types/index';

export class LocalStorage implements AuthStorage {
  set(key: string, value: string) {
    localStorage.set(key, value);
  }

  get(key: string, defaultValue: string) {
    return localStorage.get(key) || defaultValue;
  }

  remove(key: string) {
    localStorage.remove(key);
  }

  clear() {
    localStorage.clear()
  }
}
