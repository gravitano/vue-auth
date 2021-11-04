import {useRefreshToken} from './refresh-token';
import {AuthState} from './module';
import {AxiosInstance} from 'axios';
import {Router} from 'vue-router';
import {AuthOptions} from '../types/index';
import {useStorage} from './storage';
import {Store} from 'vuex';

export const registerAxiosInterceptors = <S = AuthState>(
  axios: AxiosInstance,
  options: AuthOptions,
  store: Store<S>,
  router: Router,
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
        return handleRefreshToken(error, options, store, router);
      } else {
        return Promise.reject(error);
      }
    },
  );
};

export const normalizeURL = (url: string) => {
  return String(url).startsWith('/') ? url.substr(1) : url;
};

export const handleRefreshToken = <S = AuthState>(
  error: any,
  options: AuthOptions,
  store: Store<S>,
  router: Router,
) => {
  const originalRequest = error.config;
  const isUnauthorized = error.response.status === 401;
  const refreshTokenURL = normalizeURL(options.endpoints.refresh?.url!);
  const isRefreshingToken = originalRequest.url === refreshTokenURL;
  const {refreshToken, forceLogout} = useRefreshToken(options, store, router);

  if (isUnauthorized && !isRefreshingToken) {
    forceLogout();
    return Promise.reject(error);
  }

  if (isUnauthorized && isRefreshingToken) {
    try {
      return refreshToken();
    } catch {
      forceLogout();
      if (router) {
        router.push(options.redirect.login);
      }
      return Promise.reject(error);
    }
  }

  return Promise.reject(error);
};
