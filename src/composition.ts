import {computed, ref, watch} from 'vue';
import {AxiosInstance} from 'axios';
import merge from 'lodash/merge';
import get from 'lodash/get';
import {registerAxiosInterceptors} from './axios-interceptors';
import jwtDecode from 'jwt-decode';
import {
  AuthFunction,
  AuthStorage,
  AuthUser,
  LoginPayload,
} from '../types/index';
import {Store} from 'vuex';
import {defaultOptions} from './options';
import {isTokenExpired} from './token-status';
import {useRouter} from 'vue-router';

export const createAuth: AuthFunction = <S>(
  store: Store<S>,
  options = defaultOptions,
  storage: AuthStorage,
  axios: AxiosInstance,
) => {
  const initialToken = storage.get<string | null>(
    options.token.storageName,
    null,
  );
  const initialUser = storage.get<AuthUser | null>(
    options.user.storageName,
    null,
  );

  const token = ref<string | null>(initialToken);
  const user = ref<AuthUser | null>(initialUser);
  const loggedIn = ref<boolean>(!!token.value);
  const error = ref<string | null>(null);
  const loading = ref(false);

  const router = useRouter();

  if (options.registerAxiosInterceptors) {
    registerAxiosInterceptors(axios, options);
  }

  const setUser = (userData: AuthUser) => {
    user.value = userData;
    storage.set(options.user.storageName, userData);

    store.commit('auth/setUser', userData);

    loggedIn.value = true;

    return user;
  };

  const setToken = (tokenData: string) => {
    token.value = tokenData;
    storage.set(options.token.storageName, tokenData);

    store.commit('auth/setToken', tokenData);

    return token;
  };

  const forceLogout = () => {
    user.value = null;
    token.value = null;
    loggedIn.value = false;

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

        return e.response.data;
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
        const decoded: {user?: AuthUser; exp: number} = jwtDecode(tokenData);

        if (decoded.exp) {
          storage.set(options.expiredStorage, decoded.exp);
        }

        const user = decoded.user || decoded;
        setUser(user);

        return data;
      }

      if (options.refreshToken.enabled) {
        const refreshToken = get(data, options.refreshToken.property);
        storage.set(options.refreshToken.storageName, refreshToken);
      }

      return data;
    } catch (e: any) {
      if (e.response) {
        error.value = e.response?.data?.message || e.message;
      } else if (e.request) {
        error.value = e.message;
      } else {
        error.value = e.message;
      }

      return e.response?.data;
    } finally {
      loading.value = false;
    }
  };

  const getUser = async () => {
    if (options.user.autoFetch) {
      return fetchUser();
    } else {
      const localUser = storage.get(options.user.storageName);
      return user.value || localUser;
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
    return storage.get(options.refreshToken.storageName);
  };

  const refreshToken = async () => {
    const expiredAt = storage.get<number>(options.expiredStorage);
    if (!isTokenExpired(expiredAt)) {
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

      if (options.refreshToken.autoLogout) {
        forceLogout();
        return router.push(options.redirect.login);
      }

      return null;
    } catch (e: any) {
      loading.value = false;
      error.value = e.response?.data?.message || e.message;

      if (options.refreshToken.autoLogout) {
        forceLogout();
        return router.push(options.redirect.login);
      } else {
        return e.response?.data;
      }
    } finally {
      loading.value = false;
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

  // its component-only
  // onErrorCaptured((err) => {
  //   error.value = err.message;
  // });

  watch(token, () => {
    registerAxiosInterceptors(axios, options);
  });

  const storeUser = computed(() => {
    return store.getters['auth/user'] || getUser();
  });

  const storeToken = computed(() => {
    return store.getters['auth/token'];
  });

  const storeAuthState = computed(() => {
    return store.getters['auth/isLoggedIn'];
  });

  return {
    localToken: token,
    localUser: user,
    loggedIn: storeAuthState,
    error,
    loading,
    user: storeUser,
    token: storeToken,
    storeAuthState,
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
