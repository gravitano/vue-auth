import {AuthFunction} from './types/plugin';

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $auth: AuthFunction;
  }
}
