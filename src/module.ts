import {AuthOptions, AuthUser} from './types';
import {Module} from 'vuex';
import {useStorage} from './storage';

export type RootState = Record<string, any>;
export interface AuthState {
  token: string | null;
  isLoggedIn: boolean;
  user: Record<string, any> | null;
}

export function authModule<R>(
  options: AuthOptions,
  initialState?: Record<string, any>,
): Module<AuthState, R> {
  const storage = useStorage(options.storage.driver);
  const token = storage.get<string>(options.token.storageName);
  const user = storage.get<AuthUser>(options.user.storageName);

  return {
    namespaced: true,
    state() {
      return {
        isLoggedIn: !!token,
        token: token ?? null,
        user,
        ...initialState,
      };
    },
    mutations: {
      setUser(state, user) {
        state.isLoggedIn = true;
        state.user = user;
      },
      setToken(state, token) {
        state.token = token;
      },
      logout(state) {
        state.user = null;
        state.isLoggedIn = false;
        state.token = null;
      },
    },
    getters: {
      user: (state) => state.user,
      isLoggedIn: (state) => state.isLoggedIn,
      token: (state) => state.token,
    },
  };
}
