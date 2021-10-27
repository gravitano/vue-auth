import {CookieStorage} from './cookie';
import {LocalStorage} from './local';
import {SecureLocalStorage} from './secure-ls';
import {AuthStorage, SupportedAuthStorage} from '../../types/index';

export const drivers = {
  local: LocalStorage,
  secureLs: SecureLocalStorage,
  cookie: CookieStorage,
};

export const DEFAULT_DRIVER = 'local';

export const useStorage = (driver: SupportedAuthStorage): AuthStorage =>
  new drivers[driver || DEFAULT_DRIVER]();
