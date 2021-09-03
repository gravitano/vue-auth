import { AuthOptions } from '../types'

export const defaultOptions: AuthOptions = {
  endpoints: {
    login: {
      url: '/auth/login',
      method: 'post',
    },
    logout: {
      url: '/auth/logout',
      method: 'delete',
    },
    user: {
      url: '/auth/me',
      method: 'get',
    },
  },
  token: {
    property: 'data.token',
    type: 'Bearer',
    storageName: 'auth.token',
    autoDecode: false,
    name: 'Authorization',
  },
  user: {
    autoFetch: true,
    property: 'data',
    storageName: 'auth.user',
  },
  moduleName: 'auth',
  expiredStorage: 'auth.expired',
  redirect: {
    home: '/',
    login: '/auth/login',
  },
  registerAxiosInterceptors: true,
};