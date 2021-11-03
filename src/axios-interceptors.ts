import {AuthComposition} from './../types/plugin.d';
import {AxiosInstance} from 'axios';
import {Router} from 'vue-router';
import {AuthOptions} from '../types/index';
import {useStorage} from './storage';

export const registerAxiosInterceptors = (
  axios: AxiosInstance,
  options: AuthOptions,
  auth: AuthComposition,
  router?: Router,
) => {
  axios.interceptors.request.use(
    async (config) => {
      const storage = useStorage(options.storage.driver);
      const token = storage.get(options.token.storageName);

      if (token && config.headers) {
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
      if (options.refreshToken?.enabled) {
        return handleRefreshToken(error, options, auth, router);
      } else {
        return Promise.reject(error);
      }
    },
  );
};

export const normalizeURL = (url: string) => {
  return String(url).startsWith('/') ? url.substr(1) : url;
};

export const handleRefreshToken = (
  error: any,
  options: AuthOptions,
  auth: AuthComposition,
  router?: Router,
) => {
  const originalRequest = error.config;
  const isUnauthorized = error.response.status === 401;
  const refreshTokenURL = normalizeURL(options.endpoints.refresh?.url!);
  const isRefreshingToken = originalRequest.url === refreshTokenURL;

  if (isUnauthorized && isRefreshingToken) {
    const {refreshToken} = auth;

    try {
      return refreshToken();
    } catch {
      if (router) {
        router.push(options.redirect.login);
      }
      return Promise.reject(error);
    }
  }

  return Promise.reject(error);
};
