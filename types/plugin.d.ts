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
  forceLogout(): void;
  fetchUser(): Promise<AuthUser | null>;
  setTokenHeader(tokenData: string): void;
};

export type AuthFunction = <S>(
  store: Store<S>,
  options: AuthOptions,
) => AuthComposition;
