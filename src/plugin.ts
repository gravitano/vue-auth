import {inject, App} from 'vue';
import {createAuth} from './composition';
import merge from 'lodash/merge';
import {AuthFunction, AuthOptions} from '../types/index';
import {Store} from 'vuex';
import {defaultOptions} from './options';

interface UserPlugin<S> {
  auth?: AuthFunction;
  store: Store<S>;
  options: AuthOptions;
}

export const injectAuth = (injectKey = 'auth'): AuthFunction | undefined =>
  inject(injectKey);

export const AuthPlugin = {
  install: (app: App, {auth, store, options}: UserPlugin<unknown>) => {
    if (!auth) {
      auth = (store, options) =>
        createAuth(store, merge(defaultOptions, options));
    }

    app.config.globalProperties.$auth = auth;

    app.provide('auth', auth);
  },
};
