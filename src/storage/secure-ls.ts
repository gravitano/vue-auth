import SecureLS from 'secure-ls';
import { AuthStorage } from '../types/index';

export class SecureLocalStorage implements AuthStorage {
  protected _ls: SecureLS;

  constructor(
    options = { encodingType: 'aes', isCompression: true },
  ) {

    this._ls = new SecureLS({
      ...options,
    });
  }

  set(key: string, value: string) {
    this._ls.set(key, value);
  }

  get(key: string, defaultValue: string) {
    return this._ls.get(key) || defaultValue;
  }

  remove(key: string) {
    this._ls.remove(key);
  }

  clear() {
    this._ls.clear()
  }
}
