import {AuthState} from './../src/module';
import {Store} from 'vuex';
import {Ref} from 'vue';
import {AuthOptions} from './options';
import {RouteLocationNormalized, NavigationGuardNext, Router} from 'vue-router';
import {AxiosInstance} from 'axios';
import {AuthComposition} from './plugin';

export type MiddlewareParams = {
  to: RouteLocationNormalized;
  from: RouteLocationNormalized;
  next: NavigationGuardNext;
  loggedIn?: Ref<boolean>;
  options: AuthOptions;
};

export const requiresAuthMiddleware: ({
  loggedIn,
  next,
  options,
}: MiddlewareParams) => void;

export const guestMiddleware: ({
  loggedIn,
  next,
  options,
}: MiddlewareParams) => void;

export const registerAxiosInterceptors: <S = AuthState>(
  axios: AxiosInstance,
  options: AuthOptions,
  router: Router,
) => void;
