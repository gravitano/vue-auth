import {inject, App} from 'vue';
import {createAuth} from './composition';
import merge from 'lodash/merge';
import {AuthOptions} from '../types/index';
import {Store} from 'vuex';
import {defaultOptions} from './options';

interface UserPlugin<S> {
  auth?: typeof createAuth;
  store: Store<S>;
  options: AuthOptions;
}

export const useAuth = (injectKey = 'auth') => inject(injectKey);

export const AuthPlugin = {
  install: (app: App, {auth, store, options}: UserPlugin<unknown>) => {
    if (!auth) {
      auth = createAuth(store, merge(defaultOptions, options));
    }

    app.config.globalProperties.$auth = auth;

    app.provide('auth', auth);
  },
};
