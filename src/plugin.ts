import {inject, App} from 'vue';
import {createAuth} from './composition';
import merge from 'lodash/merge';
import {AuthFunction, AuthOptions} from '../types/index';
import {Store} from 'vuex';
import {defaultOptions} from './options';
import {useStorage} from './storage';
import {AxiosInstance} from 'axios';
import defaultAxios from 'axios';

interface UserPlugin<S> {
  store: Store<S>;
  options: AuthOptions;
  axios?: AxiosInstance;
}

export const injectAuth = (injectKey = 'auth'): AuthFunction | undefined =>
  inject(injectKey);

export const AuthPlugin = {
  install: (app: App, {options, axios, store}: UserPlugin<unknown>) => {
    axios = axios || defaultAxios;

    const storage = useStorage(options.storage.driver);

    const auth = createAuth(
      store,
      merge(defaultOptions, options),
      storage,
      axios!,
    );

    app.config.globalProperties.$auth = auth;

    app.provide('auth', auth);
  },
};
