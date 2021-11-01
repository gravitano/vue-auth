import {ComputedRef, Ref} from 'vue';
import {Store} from 'vuex';
import {AuthOptions} from './options';
import {AuthStorage} from './storage';
import {AxiosInstance} from 'axios';

export type LoginPayload = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type AuthResponse<T> = {
  code: number;
  message: string;
  data: {
    token: string;
    user: T;
  };
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
  loginAs<U = AuthUser>(user: U, token: string): Promise<AuthResponse<U>>;
  login<P = LoginPayload>(payload: P): Promise<any>;
  forceLogout(): void;
  fetchUser(): Promise<AuthUser | null>;
  setTokenHeader(tokenData: string): void;
  refreshToken(): void;
  setRefreshToken(token: string): void;
};

export type AuthFunction = <S>(
  store: Store<S>,
  options: AuthOptions,
  storage: AuthStorage,
  axios: AxiosInstance,
) => AuthComposition;

export const createAuth: AuthFunction;
