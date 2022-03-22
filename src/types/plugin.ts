import {Ref} from 'vue';
import {Store} from 'vuex';
import {AuthOptions} from './options';
import {AxiosInstance} from 'axios';
import {Router} from 'vue-router';

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
  loggedIn: Ref<boolean>;
  error: Ref<AuthError>;
  loading: Ref<boolean>;
  user: Ref<AuthUser>;
  token: Ref<string>;
  setUser(userData: AuthUser): void;
  setToken(tokenData: string): void;
  logout<T = Record<string, any>>(payload?: T): void;
  loginAs<U = AuthUser>(user: U, token: string): Promise<AuthResponse<U>>;
  login<P = LoginPayload>(payload: P): Promise<any>;
  forceLogout(): void;
  fetchUser(): Promise<AuthUser | null>;
  setTokenHeader(tokenData: string): void;
  refreshToken(): void;
  setRefreshToken(token: string): void;
  getUser: () => AuthUser;
  getToken: () => Promise<string>;
  getRefreshToken: () => string;
  getLocalUser(): AuthUser;
  getFreshToken(): void;
  isExpired(): boolean;
  setTokenExpiration(tokenData: string):
    | {
        user?: AuthUser | undefined;
        exp: number;
      }
    | undefined;
  handleRefreshTokenFailed(e?: any): any;
  getTokenExpirationTime(): number;
  setRefreshTokenData(data: any): void;
};

export type AuthFunction = (
  options: AuthOptions,
  router: Router,
  axios: AxiosInstance,
) => AuthComposition;

export type AuthFunctionVuex = <S>(
  options: AuthOptions,
  store: Store<S>,
  router: Router,
  axios: AxiosInstance,
) => AuthComposition;
