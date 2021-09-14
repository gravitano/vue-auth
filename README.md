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

## Options

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
};
```

## License

Copyright @ GITS Indonesia. 2021-Present.
