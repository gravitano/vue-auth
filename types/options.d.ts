import {AxiosRequestConfig} from 'axios';
import {CookieAttributes} from 'js-cookie';

export type SupportedAuthStorage = 'local' | 'secureLs' | 'cookie';

export type AuthOptions = {
  endpoints: {
    login: AxiosRequestConfig;
    logout: AxiosRequestConfig;
    user: AxiosRequestConfig;
    refresh?: AxiosRequestConfig;
  };
  token: {
    property: string;
    type: 'Bearer' | string;
    storageName: string;
    autoDecode: boolean;
    name: string;
  };
  user: {
    autoFetch: boolean;
    property: string;
    storageName: string;
  };
  refreshToken: {
    enabled: boolean;
    property: string;
    maxAge: number;
    storageName: string;
    name: string;
  };
  moduleName: string;
  expiredStorage: string;
  redirect: {
    home: string;
    login: string;
  };
  registerAxiosInterceptors: boolean;
  storage: {
    driver: SupportedAuthStorage;
  };
  cookie?: CookieAttributes;
};
