import {computed, ComputedRef, Ref, ref, watch} from 'vue';
import {AxiosInstance} from 'axios';
import merge from 'lodash/merge';
import get from 'lodash/get';
import {registerAxiosInterceptors} from './axios-interceptors';
import jwtDecode from 'jwt-decode';
import {
  AuthComposition,
  AuthFunction,
  AuthStorage,
  AuthUser,
  LoginPayload,
} from '../types/index';
import {Store} from 'vuex';
import {defaultOptions} from './options';

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
    axios.defaults.headers[
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

      let tokenData = get(data, options.token.property);
      setToken(tokenData);

      if (options.user.autoFetch) {
        setTokenHeader(tokenData);
        return await fetchUser();
      } else if (options.token.autoDecode) {
        const decoded: {user: AuthUser} = jwtDecode(tokenData);
        const {user} = decoded;

        setUser(user);

        return data;
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

  // its component-only
  // onErrorCaptured((err) => {
  //   error.value = err.message;
  // });

  watch(token, () => {
    registerAxiosInterceptors(axios, options);
  });

  const storeUser = computed(() => {
    return store.getters['auth/user'];
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
    forceLogout,
    fetchUser,
    setTokenHeader,
  };
};
