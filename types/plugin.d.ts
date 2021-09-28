import {ComputedRef, Ref} from 'vue';
import {Store} from 'vuex';
import {AuthOptions} from './options';
import {AuthStorage} from './storage';

export type LoginPayload = {
  email: string;
  password: string;
  rememberMe?: boolean;
};
export type AuthUser = Record<string, any> | null;
export type AuthToken = string | null;
export type AuthError = string | null;

export type AuthComposition = {
  localToken: Ref<AuthToken>;
  localUser: Ref<AuthUser>;
  loggedIn: Ref<boolean>;
  error: Ref<AuthError>;
  loading: Ref<boolean>;
  user: Ref<AuthUser>;
  token: Ref<string>;
  storeAuthState: ComputedRef<boolean>;
  setUser(userData: AuthUser): Ref<AuthUser>;
  setToken(tokenData: string): Ref<AuthToken>;
  logout(): void;
  login(payload: LoginPayload): Promise<any>;
  loginAs<U = AuthUser>(user: U, token: string): Promise<U>;
  forceLogout(): void;
  fetchUser(): Promise<AuthUser | null>;
  setTokenHeader(tokenData: string): void;
};

export type AuthFunction = <S>(
  store: Store<S>,
  options: AuthOptions,
  storage: AuthStorage,
) => AuthComposition;
