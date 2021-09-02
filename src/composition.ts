import { ref, watch } from 'vue';
import axios from 'axios';
import merge from 'lodash/merge';
import get from 'lodash/get';
import { registerAxiosInterceptors } from './axios-interceptors';
import jwtDecode from 'jwt-decode';
import { AuthOptions, AuthUser, LoginPayload } from '../types/index';
import { storage } from './storage';
import { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import { requiresAuthMiddleware, guestMiddleware } from './middleware';

export const defaultOptions: AuthOptions = {
  endpoints: {
    login: {
      url: '/auth/login',
      method: 'post',
    },
    logout: {
      url: '/auth/logout',
      method: 'delete',
    },
    user: {
      url: '/auth/me',
      method: 'get',
    },
  },
  token: {
    property: 'data.token',
    type: 'Bearer',
    storageName: 'auth.token',
    autoDecode: false,
    name: 'Authorization',
  },
  user: {
    autoFetch: true,
    property: 'data',
    storageName: 'auth.user',
  },
  moduleName: 'auth',
  expiredStorage: 'auth.expired',
  redirect: {
    home: '/',
    login: '/auth/login',
  },
  registerAxiosInterceptors: true,
};

export const createAuth = (options = defaultOptions) => {
  const token = ref<string | null>(storage.get(options.token.storageName));
  const user = ref<AuthUser | null>(storage.get(options.token.storageName, null));
  const loggedIn = ref<boolean>(!!token);
  const error = ref<string | null>(null);
  const loading = ref(false);

  if (options.registerAxiosInterceptors) {
    registerAxiosInterceptors(axios, options);
  }

  const setUser = (userData: AuthUser) => {
    user.value = userData;
    storage.set(options.token.storageName, userData);

    loggedIn.value = true;

    return user;
  };

  const setToken = (tokenData: string) => {
    token.value = tokenData;
    storage.set(options.token.storageName, tokenData);

    return token;
  };

  const forceLogout = () => {
    user.value = null;
    token.value = null;
    loggedIn.value = false;

    storage.clear();

    return Promise.resolve(true);
  };

  const logout = async () => {
    if (options.endpoints.logout) {
      try {
        loading.value = true;
        const { data } = await axios.request(merge(options.endpoints.logout));
        loading.value = false;

        await forceLogout();

        return data;
      } catch (e) {
        loading.value = false;
        error.value = e.response.data?.message || e.message;

        return e.response.data;
      }
    } else {
      return await forceLogout();
    }
  };

  const fetchUser = async () => {
    try {
      loading.value = true;
      const { data } = await axios.request(merge(options.endpoints.user));
      loading.value = false;

      setUser(get(data, options.user.property));

      return data;
    } catch (e) {
      loading.value = false;
      error.value = e.response.data?.message || e.message;

      return e.response.data;
    }
  };

  const login = async (payload: LoginPayload) => {
    try {
      loading.value = true;
      error.value = '';

      const { data } = await axios.request(
        merge(options.endpoints.login, {
          data: payload,
        }),
      );
      loading.value = false;

      let tokenData = get(data, options.token.property);
      setToken(tokenData);

      if (options.user.autoFetch) {
        return await fetchUser();
      } else if (options.token.autoDecode) {
        const decoded: { user: AuthUser } = jwtDecode(tokenData);
        const { user } = decoded;

        setUser(user);

        return data;
      }

      return data;
    } catch (e) {
      loading.value = false;
      error.value = e.response.data?.message || e.message;

      return e.response.data;
    }
  };

  // its component-only
  // onErrorCaptured((err) => {
  //   error.value = err.message;
  // });

  watch(token, () => {
    registerAxiosInterceptors(axios, options);
  });

  const handleMiddleware = (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const middlewareParams = { to, from, next, loggedIn, options };
    switch (to.meta.auth) {
      case 'guest':
        guestMiddleware(middlewareParams);
        break;
      case true:
        requiresAuthMiddleware(middlewareParams);
        break;
      default:
        next();
        break;
    }
  };

  return {
    token,
    user,
    loggedIn,
    error,
    loading,
    setUser,
    setToken,
    logout,
    login,
    forceLogout,
    handleMiddleware,
    fetchUser,
  };
};
