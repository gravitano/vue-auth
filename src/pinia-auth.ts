import {AuthOptions, AuthUser, LoginPayload} from './types';
import {isTokenExpired} from './token-status';
import {useStorage} from './storage';
import jwtDecode from 'jwt-decode';
import merge from 'lodash/merge';
import get from 'lodash/get';
import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import {Router} from 'vue-router';
import {AxiosInstance} from 'axios';

export const createPiniaAuth = (
  options: AuthOptions,
  router: Router,
  axios: AxiosInstance,
) =>
  defineStore('auth', () => {
    const storage = useStorage(options.storage.driver);

    const user = ref<AuthUser | null>(storage.get(options.user.storageName));
    const token = ref(storage.get(options.token.storageName));
    const error = ref('');
    const loading = ref(false);

    const loggedIn = computed(() => !!user.value && !!token.value);

    const setUser = (userData: AuthUser) => {
      storage.set(options.user.storageName, userData);
      user.value = userData;
    };

    const setToken = (tokenData: string) => {
      storage.set(options.token.storageName, tokenData);

      token.value = tokenData;

      setTokenExpiration(tokenData);
    };

    const generateExpDate = () => {
      const currDate = new Date();
      const newDate = new Date();
      newDate.setTime(currDate.getTime() + 30 * 60 * 1000);
      return newDate.getTime();
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
      } else {
        storage.set(options.expiredStorage, generateExpDate());
      }
    };

    const resetState = () => {
      user.value = null;
      token.value = '';
      loading.value = false;
      error.value = '';
    };

    const forceLogout = () => {
      storage.clear(options);

      resetState();

      return Promise.resolve(true);
    };

    const logout = async () => {
      if (options.endpoints.logout) {
        try {
          loading.value = true;
          const {data} = await axios!.request(merge(options.endpoints.logout));
          loading.value = false;

          await forceLogout();

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
        const res = await axios!.request(merge(options.endpoints.user));
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
      (axios!.defaults.headers as any)[
        options.token.name
      ] = `${options.token.type} ${tokenData}`;
    };

    const login = async <P = LoginPayload>(payload: P) => {
      loading.value = true;
      error.value = '';

      try {
        const res = await axios!.request(
          merge(options.endpoints.login, {
            data: payload,
          }),
        );

        const tokenData = get(res.data, options.token.property);
        setToken(tokenData);

        if (options.user.autoFetch) {
          setTokenHeader(tokenData);
          await fetchUser();
          return router!.push(options.redirect.home);
        } else if (options.token.autoDecode) {
          const decoded = setTokenExpiration(tokenData);

          const user = decoded?.user || decoded;
          if (user) {
            setUser(user);
          }

          return res;
        }

        setRefreshTokenData(res.data);

        return res;
      } catch (e: any) {
        if (e.response) {
          error.value = e.response?.data?.message || e.message;
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

    const getLocalUser = <T = AuthUser>() => {
      return storage.get<T>(options.user.storageName);
    };

    const getUser = async () => {
      if (options.user.autoFetch) {
        return fetchUser();
      } else {
        return getLocalUser();
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
      const expiredAt = getTokenExpirationTime();
      if (expiredAt && !isTokenExpired(expiredAt)) {
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
      } catch (e: any) {
        return handleRefreshTokenFailed(e);
      } finally {
        loading.value = false;
      }
    };

    const handleRefreshTokenFailed = (e?: any) => {
      if (options.refreshToken.autoLogout) {
        forceLogout();
        router!.push(options.redirect.login);
      }

      return e;
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
      setTokenExpiration,
      handleRefreshTokenFailed,
      getTokenExpirationTime,
      setRefreshTokenData,
      getLocalUser,
    };
  });
