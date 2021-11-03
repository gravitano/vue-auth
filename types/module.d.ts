import {AxiosInstance} from 'axios';
import {Module} from 'vuex';
import {AuthState} from '../src/module';
import {AuthOptions} from './options';
import {AuthStorage} from './storage';

export function authModule<R>(
  options: AuthOptions,
  initialState?: Record<string, any>,
): Module<AuthState, R>;
