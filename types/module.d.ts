import {AxiosInstance} from 'axios';
import {Module} from 'vuex';
import {AuthState} from '../src/module';
import {AuthOptions} from './options';
import {AuthStorage} from './storage';

export function authModule<R>(
  initialState: Record<string, any>,
  options: AuthOptions,
  axios: AxiosInstance,
  storage: AuthStorage,
): Module<AuthState, R>;
