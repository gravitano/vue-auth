import {RootState} from './module';
import {AuthOptions} from './../types/options.d';
import {Router, useRouter} from 'vue-router';
import {useStorage} from './storage';
import {isTokenExpired} from './token-status';
import {ref} from 'vue';
import axios from 'axios';
import {get} from 'lodash';
import {Store} from 'vuex';
import jwtDecode from 'jwt-decode';
import {AuthUser} from '../types';

export const useRefreshToken = <S = RootState>(
  options: AuthOptions,
  store: Store<S>,
  router: Router,
) => {
  const storage = useStorage(options.storage.driver);

  const loading = ref(false);
  const error = ref('');

  const forceLogout = () => {
    storage.clear(options);

    store!.commit('auth/logout');

    return Promise.resolve(true);
  };

  const setTokenExpiration = (tokenData: string) => {
    if (options.token.autoDecode) {
      try {
        const decoded = jwtDecode<{user?: AuthUser; exp: number}>(tokenData);

        if (decoded.exp) {
          storage.set(options.expiredStorage, decoded.exp);
          return decoded;
        }
      } catch {
        return null;
      }
    }
  };

  const setToken = (tokenData: string) => {
    storage.set(options.token.storageName, tokenData);
    store.commit('auth/setToken', tokenData);

    setTokenExpiration(tokenData);
  };

  const getTokenExpirationTime = () => {
    return storage.get<number>(options.expiredStorage);
  };

  const setRefreshToken = (token: string) => {
    storage.set(options.refreshToken.storageName, token);
  };

  const getRefreshToken = () => {
    return storage.get<string>(options.refreshToken.storageName);
  };

  const refreshToken = async () => {
    // console.info('Refreshing token...');

    const expiredAt = getTokenExpirationTime();
    // console.log(expiredAt);
    if (!isTokenExpired(expiredAt)) {
      // console.info('Token is not expired yet');
      return null;
    }

    try {
      loading.value = true;

      const refreshToken = getRefreshToken();
      const refreshTokenName = options.refreshToken.name;

      const res = await axios.request({
        ...options.endpoints.refresh,
        data: {
          [refreshTokenName]: refreshToken,
        },
      });

      if (res.status === 200) {
        const newToken = get(res.data, options.token.property);
        const newRefreshToken = get(res.data, options.refreshToken.property);

        setRefreshToken(newRefreshToken);
        setToken(newToken);

        return res.data;
      }

      return handleRefreshTokenFailed(res);
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message;

      return handleRefreshTokenFailed(e);
    } finally {
      loading.value = false;
    }
  };

  const handleRefreshTokenFailed = (e?: any) => {
    if (options.refreshToken.autoLogout) {
      forceLogout();
      return router!.push(options.redirect.login);
    } else {
      return e?.response;
    }
  };

  return {
    error,
    loading,
    handleRefreshTokenFailed,
    refreshToken,
    forceLogout,
    getTokenExpirationTime,
    setRefreshToken,
    getRefreshToken,
    setToken,
    setTokenExpiration,
  };
};
