import {AuthFunction} from './plugin.d';

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $auth: AuthFunction;
  }
}
