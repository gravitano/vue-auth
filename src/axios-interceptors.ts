
import { AxiosInstance } from 'axios'
import { storage } from './storage';
import { AuthOptions } from '../types/index';

export const registerAxiosInterceptors = (axios: AxiosInstance, options: AuthOptions) => {
  axios.interceptors.request.use(
    function (config) {
      const token = storage.get(options.token.storageName)
      if (token) {
        config.headers[options.token.name] = `${options.token.type} ${token}`;
      }
      return config;
    },
    function (error) {
      return Promise.reject(error);
    },
  );

  axios.interceptors.response.use(
    function (response) {
      return response;
    },
    function (error) {
      return Promise.reject(error);
    },
  );
};