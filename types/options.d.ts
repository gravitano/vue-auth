import {AxiosRequestConfig} from 'axios';

export type AuthOptions = {
  endpoints: {
    login: AxiosRequestConfig;
    logout: AxiosRequestConfig;
    user: AxiosRequestConfig;
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
  moduleName: string;
  expiredStorage: string;
  redirect: {
    home: string;
    login: string;
  };
  registerAxiosInterceptors: boolean;
};
