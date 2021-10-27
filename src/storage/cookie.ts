import {AuthStorage, AuthOptions} from '../../types/index';
import Cookies from 'js-cookie';

export class CookieStorage implements AuthStorage {
  set(key: string, value: any) {
    Cookies.set(key, JSON.stringify(value));
  }

  get(key: string, defaultValue: any) {
    try {
      const value = Cookies.get(key);
      return JSON.parse(value!);
    } catch {
      return defaultValue;
    }
  }

  remove(key: string) {
    Cookies.remove(key);
  }

  clear(options?: AuthOptions) {
    Cookies.remove(options?.token?.storageName!);
    Cookies.remove(options?.user?.storageName!);
    Cookies.remove(options?.expiredStorage!);
  }
}
