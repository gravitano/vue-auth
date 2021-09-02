import { inject, App } from 'vue';
import { defaultOptions, createAuth } from './composition';
import merge from 'lodash/merge';
import { AuthOptions } from './types/index';

export const injectAuth = () => inject('auth');

export const AuthPlugin = {
  install: (app: App, options?: AuthOptions) => {
    const $auth = createAuth(merge(defaultOptions, options));

    app.config.globalProperties.$auth = $auth;

    app.provide('auth', $auth);
  },
};
