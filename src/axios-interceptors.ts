import {AuthState} from './module';
import {AxiosInstance} from 'axios';
import {Router} from 'vue-router';
import {AuthOptions} from './types/index';
import {useStorage} from './storage';
import {Store} from 'vuex';
import {createAuth} from './composition';
import get from 'lodash/get';

export const normalizeURL = (url: string) => {
  return String(url).startsWith('/') ? url.substr(1) : url;
};

export const registerAxiosInterceptors = <S = AuthState>(
  axios: AxiosInstance,
  options: AuthOptions,
  store: Store<S>,
  router: Router,
) => {
  const storage = useStorage(options.storage.driver);
  const {setToken, getRefreshToken, setTokenHeader} = createAuth(
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
      const originalRequest = error.config;

      const originalRequestUrl = normalizeURL(originalRequest.url);
      const refreshTokenUrl = normalizeURL(options.endpoints.refresh?.url!);

      if (
        error.response.status === 401 &&
        originalRequestUrl === refreshTokenUrl &&
        options.refreshToken.autoLogout
      ) {
        router.push({
          path: options.redirect.login,
          query: {
            failed_refresh_token: 1,
          },
        });
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
