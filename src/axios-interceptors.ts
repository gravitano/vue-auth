import {AuthState} from './module';
import {AxiosInstance} from 'axios';
import {Router} from 'vue-router';
import {AuthOptions} from '../types';
import {useStorage} from './storage';
import {createAuth} from './auth';

export const registerAxiosInterceptors = (
  axios: AxiosInstance,
  options: AuthOptions,
  router: Router,
) => {
  const storage = useStorage(options.storage.driver);
  const {setToken, getRefreshToken, setTokenHeader, forceLogout} = createAuth(
    options,
    store,
    router,
    axios,
  );

  const getAccessToken = () => {
    return storage.get(options.token.storageName);
  };

  axios.interceptors.request.use(
    (config) => {
      const token = getAccessToken();

      if (token && config.headers) {
        config.headers[options.token.name] = `${options.token.type} ${token}`;
      }
      return config;
    },
    (error) => {
      Promise.reject(error);
    },
  );

  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    function (error) {
      if (options.refreshToken?.enabled) {
        return handleRefreshToken(error, options, router);
      } else {
        return Promise.reject(error);
      }

      const isLogin =
        originalRequestUrl === normalizeURL(options.endpoints.login.url!);
      if (
        error.response.status === 401 &&
        !originalRequest._retry &&
        options.refreshToken.enabled &&
        !isLogin
      ) {
        originalRequest._retry = true;

        return axios
          .request({
            ...options.endpoints.refresh,
            data: {
              [options.refreshToken.name]: getRefreshToken(),
            },
          })
          .then((res) => {
            if (res.status === 200) {
              const newToken = get(res.data, options.token.property);
              setToken(newToken);
              setTokenHeader(newToken);
              return axios(originalRequest);
            }
          });
      }

      return Promise.reject(error);
    },
  );
};

export const normalizeURL = (url: string) => {
  return String(url).startsWith('/') ? url.substr(1) : url;
};

let retryCount = 0;

export const handleRefreshToken = <S = AuthState>(
  error: any,
  options: AuthOptions,
  router: Router,
) => {
  const originalRequest = error.config;
  const isUnauthorized = error.response.status === 401;
  const refreshTokenURL = normalizeURL(options.endpoints.refresh?.url!);
  const isRefreshingToken =
    normalizeURL(originalRequest.url) === refreshTokenURL;
  const useAuth = createAuth(options, router);
  const auth = useAuth();

  if (isUnauthorized && !isRefreshingToken) {
    auth.forceLogout();
    router.push(options.redirect.login);
    return error;
  }

  if (retryCount > 0) {
    return new Error('Refresh exceed maximum catches!');
  }

  if (isUnauthorized && !originalRequest._retry) {
    retryCount++;
    originalRequest._retry = true;

    return auth.refreshToken();
  }

  return Promise.reject(error);
};
