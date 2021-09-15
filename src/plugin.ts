import {inject, App} from 'vue';
import {createAuth} from './composition';
import merge from 'lodash/merge';
import {AuthFunction, AuthOptions} from '../types/index';
import {Store} from 'vuex';
import {defaultOptions} from './options';
import {useStorage} from './storage';

interface UserPlugin<S> {
  auth?: AuthFunction;
  store: Store<S>;
  options: AuthOptions;
}

export const injectAuth = (injectKey = 'auth'): AuthFunction | undefined =>
  inject(injectKey);

export const AuthPlugin = {
  install: (app: App, {auth, store, options}: UserPlugin<unknown>) => {
    const storage = useStorage(options.storage.driver);
    if (!auth) {
      auth = (store, options) =>
        createAuth(store, merge(defaultOptions, options), storage);
    }

    app.config.globalProperties.$auth = auth;

    app.provide('auth', auth);
  },
};
