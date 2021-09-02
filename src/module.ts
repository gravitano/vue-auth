import { AxiosInstance } from 'axios';
import { AuthOptions, AuthStorage } from '../types';
import { Module } from 'vuex'
import get from 'lodash/get';

export type RootState = Record<string, any>
export interface AuthState {
  token: string | null,
  isLoggedIn: boolean,
  user: Record<string, any> | null
}

export function authModule<R>(
  initialState: Record<string, any> = {},
  options: AuthOptions,
  axios: AxiosInstance,
  storage: AuthStorage,
): Module<AuthState, R> {
  return {
    namespaced: true,
    state() {
      return {
        token: null,
        isLoggedIn: false,
        user: null,
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
      },
    },
    actions: {
      async fetchUser({ commit }) {
        try {
          const { data } = await axios.request(options.endpoints.user);
          const user = get(data, options.user.property);
          commit('setUser', user);
          storage.set(options.user.storageName, user);
          return data;
        } catch (e) {
          return Promise.reject(e);
        }
      },
    },
    getters: {
      user: (state) => state.user,
      isLoggedIn: (state) => state.isLoggedIn,
      token: (state) => state.token,
    },
  }
};
