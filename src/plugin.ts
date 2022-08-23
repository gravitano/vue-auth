import {inject, App} from 'vue';
import {createAuth} from './vuex-auth';
import merge from 'lodash.merge';
import {AuthFunction, AuthOptions} from './types/index';
import {Store} from 'vuex';
import {defaultOptions} from './options';
import {AxiosInstance} from 'axios';
import defaultAxios from 'axios';
import {Router} from 'vue-router';

interface UserPlugin<S> {
  store: Store<S>;
  options: AuthOptions;
  router: Router;
  axios: AxiosInstance;
}

export const injectAuth = (injectKey = 'auth'): AuthFunction | undefined =>
  inject(injectKey);

export const AuthPlugin = {
  install: (app: App, {options, axios, router, store}: UserPlugin<unknown>) => {
    axios = axios || defaultAxios;

    const auth = createAuth(
      merge(defaultOptions, options),
      store,
      router,
      axios,
    );

    app.config.globalProperties.$auth = auth;

    app.provide('auth', auth);
  },
};
