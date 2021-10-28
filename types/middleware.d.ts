import {Ref} from 'vue';
import {AuthOptions} from './options';
import {RouteLocationNormalized, NavigationGuardNext} from 'vue-router';

export type MiddlewareParams = {
  to: RouteLocationNormalized;
  from: RouteLocationNormalized;
  next: NavigationGuardNext;
  loggedIn: Ref<boolean>;
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
