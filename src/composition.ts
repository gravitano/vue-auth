import {computed, ref} from 'vue';
import defaultAxios, {AxiosInstance} from 'axios';
import merge from 'lodash/merge';
import get from 'lodash/get';
import jwtDecode from 'jwt-decode';
import {AuthFunction, AuthUser, LoginPayload} from '../types/index';
import {Store, useStore} from 'vuex';
import {defaultOptions} from './options';
import {isTokenExpired} from './token-status';
import {Router, useRouter} from 'vue-router';
import {useStorage} from './storage';

export const createAuth: AuthFunction = <S>(
  options = defaultOptions,
  axios?: AxiosInstance,
  store?: Store<S>,
  router?: Router,
) => {
  axios =
    axios ||
    defaultAxios.create({
      baseURL: options.baseURL,
    });

  store = store || useStore();
  router = router || useRouter();

  const storage = useStorage(options.storage.driver);

  const error = ref('');
  const loading = ref(false);

  const setUser = (userData: AuthUser) => {
    storage.set(options.user.storageName, userData);
    store.commit('auth/setUser', userData);
  };

  const setToken = (tokenData: string) => {
    storage.set(options.token.storageName, tokenData);
    store.commit('auth/setToken', tokenData);

    setTokenExpiration(tokenData);
  };

  const setTokenExpiration = (tokenData: string) => {
    const decoded = jwtDecode<{user?: AuthUser; exp: number}>(tokenData);

    if (decoded.exp) {
      storage.set(options.expiredStorage, decoded.exp);
      // console.info('Exp data updated!');
    } else {
      // console.warn('Exp data not found on token', tokenData);
    }

    return decoded;
  };

  const forceLogout = () => {
    storage.clear(options);

    store.commit('auth/logout');

    return Promise.resolve(true);
  };

  const logout = async () => {
    if (options.endpoints.logout) {
      try {
        loading.value = true;
        const {data} = await axios.request(merge(options.endpoints.logout));
        loading.value = false;

        await forceLogout();

        store.commit('auth/logout');

        return data;
      } catch (e: any) {
        loading.value = false;
        error.value = e.response?.data?.message || e.message;

        return e.response;
      }
    } else {
      return await forceLogout();
    }
  };

  const fetchUser = async () => {
    try {
      loading.value = true;
      const res = await axios.request(merge(options.endpoints.user));
      loading.value = false;

      const data = res?.data;

      setUser(get(data, options.user.property));

      return data;
    } catch (e: any) {
      loading.value = false;
      error.value = e.response?.data?.message || e.message;

      return e.response.data;
    }
  };

  const setTokenHeader = (tokenData: string) => {
    (axios.defaults.headers as any)[
      options.token.name
    ] = `${options.token.type} ${tokenData}`;
  };

  const login = async <P = LoginPayload>(payload: P) => {
    loading.value = true;

    try {
      error.value = '';

      const {data} = await axios.request(
        merge(options.endpoints.login, {
          data: payload,
        }),
      );

      const tokenData = get(data, options.token.property);
      setToken(tokenData);

      if (options.user.autoFetch) {
        setTokenHeader(tokenData);
        return await fetchUser();
      } else if (options.token.autoDecode) {
        const decoded = setTokenExpiration(tokenData);

        const user = decoded.user || decoded;
        setUser(user);

        return data;
      }

      setRefreshTokenData(data);

      return data;
    } catch (e: any) {
      if (e.response) {
        error.value = e.response?.data?.message || e.message;
      } else if (e.request) {
        error.value = e.message;
      } else {
        error.value = e.message;
      }

      return e.response;
    } finally {
      loading.value = false;
    }
  };

  const setRefreshTokenData = (data: any) => {
    if (options.refreshToken.enabled) {
      const refreshToken = get(data, options.refreshToken.property);
      storage.set(options.refreshToken.storageName, refreshToken);
    }
  };

  const getUser = async () => {
    if (options.user.autoFetch) {
      return fetchUser();
    } else {
      return storage.get(options.user.storageName);
    }
  };

  const isExpired = () => {
    const expireTime = storage.get<number>(options.expiredStorage);
    return isTokenExpired(expireTime);
  };

  const getFreshToken = () => {
    return storage.get<string>(options.token.storageName);
  };

  const getToken = async () => {
    if (isExpired()) {
      await refreshToken();
      return getFreshToken();
    } else {
      return getFreshToken();
    }
  };

  const setRefreshToken = (token: string) => {
    storage.set(options.refreshToken.storageName, token);
  };

  const getRefreshToken = () => {
    return storage.get<string>(options.refreshToken.storageName);
  };

  const getTokenExpirationTime = () => {
    return storage.get<number>(options.expiredStorage);
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
      return router.push(options.redirect.login);
    } else {
      return e?.response;
    }
  };

  const loginAs = <U = AuthUser>(user: U, token: string) => {
    setUser(user);
    setToken(token);
    setTokenHeader(token);

    return Promise.resolve({
      code: 200,
      data: {user, token},
      message: 'OK',
    });
  };

  const user = computed(() => {
    return store?.getters['auth/user'] || getUser();
  });

  const token = computed(() => {
    return store?.getters['auth/token'];
  });

  const loggedIn = computed(() => {
    return store?.getters['auth/isLoggedIn'];
  });

  return {
    loggedIn,
    error,
    loading,
    user,
    token,
    setUser,
    setToken,
    logout,
    login,
    loginAs,
    forceLogout,
    fetchUser,
    setTokenHeader,
    refreshToken,
    setRefreshToken,
    getRefreshToken,
    getToken,
    getUser,
    getFreshToken,
    isExpired,
  };
};
