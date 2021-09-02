import {AuthStorage} from '../../types/index';

export class LocalStorage implements AuthStorage {
  set(key: string, value: any) {
    localStorage.setItem(key, value);
  }

  get(key: string, defaultValue: any) {
    return localStorage.getItem(key) || defaultValue;
  }

  remove(key: string) {
    localStorage.remove(key);
  }

  clear() {
    localStorage.clear();
  }
}
