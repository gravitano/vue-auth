export interface AuthStorage {
  set(key: string, value: any): void;
  get<T>(key: string, defaultValue?: any): T;
  remove(key: string): void;
  clear(): void;
}