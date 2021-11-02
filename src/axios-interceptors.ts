import {AxiosInstance} from 'axios';
import {AuthComposition, AuthOptions} from '../types/index';

export const registerAxiosInterceptors = (
  axios: AxiosInstance,
  options: AuthOptions,
  auth: AuthComposition,
) => {
  const {getToken} = auth;

  axios.interceptors.request.use(
    async (config) => {
      const token = await getToken();
      if (token && config.headers) {
        config.headers[options.token.name] = `${options.token.type} ${token}`;
      }
      return config;
    },
    function (error) {
      return Promise.reject(error);
    },
  );

  axios.interceptors.response.use(
    function (response) {
      return response;
    },
    function (error) {
      return Promise.reject(error);
    },
  );
};
