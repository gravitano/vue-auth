import {AuthOptions} from './options';

export interface AuthStorage {
  set(key: string, value: any, options?: AuthOptions): void;
  get<T>(key: string, defaultValue?: any): T;
  remove(key: string): void;
  clear(options?: AuthOptions): void;
}
