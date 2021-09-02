import { inject, App } from 'vue';
import { defaultOptions, createAuth } from './composition';
import merge from 'lodash/merge';
import { AuthOptions } from '../types/index';
import { Store } from 'vuex';

export const injectAuth = () => inject('auth');

export const AuthPlugin = {
  install: (app: App, { store, options }: { store: Store<any>, options: AuthOptions }) => {
    const $auth = createAuth(store, merge(defaultOptions, options));

    app.config.globalProperties.$auth = $auth;

    app.provide('auth', $auth);
  },
};
