# Auth

> Authentication Plugin for Vue 3

- [Auth](#auth)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Use as Vue Plugin](#use-as-vue-plugin)
    - [Use with Composition API](#use-with-composition-api)
      - [`login(payload: Object): Promise<AxiosResponse>`](#loginpayload-object-promiseaxiosresponse)
      - [`fetchUser(): Promise<AxiosResponse>`](#fetchuser-promiseaxiosresponse)
      - [`setToken(tokenData: string): void`](#settokentokendata-string-void)
      - [`setUser(userData: Object): void`](#setuseruserdata-object-void)
      - [`logout(): boolean`](#logout-boolean)
      - [`forceLogout(): boolean`](#forcelogout-boolean)
      - [`user: Object`](#user-object)
      - [`loggedIn: boolean`](#loggedin-boolean)
    - [Manually Creating The Auth Function](#manually-creating-the-auth-function)
  - [Options](#options)
  - [License](#license)

## Installation

Install the package just like regular npm package.

```bash
npm i @gravitano/vue-auth
# OR
yarn add @gravitano/vue-auth
```

## Usage

### Use as Vue Plugin

Install the plugin to your Vue app.

```js
// main.js
import {createApp} from 'vue';
import AuthPlugin from '@gravitano/vue-auth'; // 👈 import the plugin

const app = createApp(App);

app.use(AuthPlugin); // 👈 use the plugin

app.mount('#app');
```

After that, you can access the plugin via `$auth` global property.

```html
<template>
  <div v-if="$auth.loggedIn">Logged In as : {{ $auth.user.name }}</div>
</template>
```

If you are using composition API, you can also access the `auth` object by using `inject` method.

```js
import {injectAuth} from '@gravitano/vue-auth'

// user is Ref
const {user} = injectAuth()

// access the user
console.log(user)
```

### Use with Composition API

To use the auth in composition API, just import and use the `useAuth` function.

```ts
import {useAuth} from '@gravitano/vue-auth';

const auth = useAuth();

// OR with object destruction
const {user} = useAuth();
```

#### `login(payload: Object): Promise<AxiosResponse>`

Login the user and save token to the auth storage.

```js
auth.login({
  email: 'admin@example.com',
  password: 'admin',
});
```

#### `fetchUser(): Promise<AxiosResponse>`

Fetch user data from API.

```js
const user = await auth.fetchUser();
console.log(user);
```

#### `setToken(tokenData: string): void`

Manually Set User Token.

```js
auth.setToken(token);
```

#### `setUser(userData: Object): void`

Manually set the user data.

```js
const userData = {
  id: 1,
  name: 'Admin',
};

auth.setUser(userData);
```

#### `logout(): boolean`

Logout the current user.

```js
auth.logout();
```

#### `forceLogout(): boolean`

Force logout the current user.

```js
auth.forceLogout();
```

#### `user: Object`

Get the current user data.

```js
console.log(auth.user);
```

#### `loggedIn: boolean`

Get the current logged in state.

```js
console.log(auth.loggedIn);
```


### Manually Creating The Auth Function

First, create `auth.ts` file under your `src/plugins` folder.
```ts
// src/plugins/auth.ts
import {AuthOptions} from '@gravitano/vue-auth/types';
import {createAuth} from '@gravitano/vue-auth';
import {authOptions} from '~/config'; // 👈 your custom config
import store, {AppRootState} from '~/store';

export const useAuth = () => createAuth<AppRootState>(store, authOptions);
```

Then, in your component, just import and use it as regular composition function. For example:
```vue
<script setup lang="ts">
import {useAuth} from '~/plugins/auth'

// destruct user object from `useAuth` function
const {user} = useAuth();

console.log(user); // <-- user data
</script>
```

## Default Options

This is the default options object:

```ts
import { AuthOptions } from '@gravitano/vue-auth/types'

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
  storage: {
    driver: 'secureLs', // supported: local, secureLs (secure local storage)
  },
};
```


## Options

### `endpoints`

- #### `login`
  - `url`: Login path. E.g. `/user/login`
  - `method`: HTTP Method. E.g. `GET`, `POST`, etc.
- #### `logout`
  - `url`: Logout path. E.g. `/user/logout`
  - `method`: HTTP Method. E.g. `GET`, `POST`, etc.
- #### `user`
  - `url`: Endpoint for getting user data. E.g. `/my/profile`
  - `method`: HTTP Method. E.g. `GET`, `POST`, etc.

### `token`

- #### `property`
  Token property path using dot notation.
  - Type: `string`
  - Default: `data.token`
- #### `type`
  Token type.
  - Type: `string`
  - Default: `Bearer`
- #### `storageName`
  Token storage name.
  - Type: `string`
  - Default: `auth.token`
- #### `autoDecode`
  Auto decodes token when possible. Usually used when using JWT Token.
  - Type: `boolean`
  - Default: `true`
- #### `name`
  Token header name.
  - Type: `string`
  - Default:`Authorization`

### `user`

- #### `autoFetch`
  Fetch user data automatically when user successfully logged in.
  - Type: `boolean`
  - Default: `true`
- #### `property`
  Property path of user data.
  - Type: `string`
  - Default: `data`
- #### `storageName`
  Storage name for storing user data.
  - Type: `string`
  - Default: `auth.user`

### `moduleName`
  Vuex's module name.
  - Default: `auth`
  - Type: `string`

### `expiredStorage`
  Storage name for storing token expiratin time.
  - Type: `string`
  - Default: `auth.expired`

### `redirect`
  
- #### `home`
  Homepage path.
  - Type: `string`
  - Default: `/`
- #### `login`
  Login path.
  - Type: `string`
  - Default: `/`


### `registerAxiosInterceptors`
  Register custom axios interceptors when `true`. Set the value to `false` if you want to use your own interceptors.
  - Type: `boolean`
  - Default: `true`

### `storage`

- #### `driver`
  - Type: `string`
  - Default: `secureLs`
  - Available Options: `local` | `secureLs`



## License

[MIT](https://opensource.org/licenses/MIT)
