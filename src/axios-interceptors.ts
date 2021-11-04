import {AuthState} from './module';
import {AxiosInstance} from 'axios';
import {Router} from 'vue-router';
import {AuthOptions} from '../types/index';
import {useStorage} from './storage';
import {Store} from 'vuex';
import {createAuth} from './composition';

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
        return handleRefreshToken(error, options, store, router, axios);
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
  axios: AxiosInstance,
) => {
  const originalRequest = error.config;
  const isUnauthorized = error.response.status === 401;
  const refreshTokenURL = normalizeURL(options.endpoints.refresh?.url!);
  const isRefreshingToken = originalRequest.url === refreshTokenURL;
  const {refreshToken, forceLogout} = createAuth(options, store, router, axios);

  // if (isUnauthorized && !isRefreshingToken) {
  //   forceLogout();
  //   return Promise.reject(error);
  // }

  if (isUnauthorized) {
    try {
      return refreshToken();
    } catch {
      forceLogout();
      if (router) {
        return router.push(options.redirect.login);
      }
      return Promise.reject(new Error('Refresh token failed'));
    }
  }

  return Promise.reject(error);
};
