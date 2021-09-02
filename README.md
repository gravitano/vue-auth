# Auth

> Auth Plugin for Vue 3

## Installation

- Add repo as submodule on your project
  ```bash
  cd /path-to-your-project
  git clone git@git.gits.id:frontend/starter/vue-3/auth.git src/packages/auth
  ```
- Add auth package as npm dependencies. Open `package.json` and add this line inside your `dependencies` block.
  ```json
  "dependencies": {
    // ... other dependecies
    "@frontend/auth": "file:src/packages/auth"
  }
  ```
- Install the package by running `npm install`
- Done

## Usage with Composition API

Import the package and create the `auth` variable.

```js
// /src/plugins/auth.js
import {useAuth} from '@frontend/auth';

const options = {
  endpoints: {
    login: {
      url: '/login',
      method: 'post',
    },
    logout: {
      url: '/logout',
      method: 'delete',
    },
    user: {
      url: '/my/profile',
      method: 'get',
    },
  },
};

const auth = useAuth(options);
```

### `login(payload: Object): Promise<AxiosResponse>`

Login the user and save token to the auth storage.

```js
auth.login({
  email: 'admin@example.com',
  password: 'admin',
});
```

### `fetchUser(): Promise<AxiosResponse>`

Fetch user data from API.

```js
const user = await auth.fetchUser();
console.log(user);
```

### `setToken(tokenData: string): void`

Manually Set User Token.

```js
auth.setToken(token);
```

### `setUser(userData: Object): void`

Manually set the user data.

```js
const userData = {
  id: 1,
  name: 'Admin',
};

auth.setUser(userData);
```

### `logout(): boolean`

Logout the current user.

```js
auth.logout();
```

### `forceLogout(): boolean`

Force logout the current user.

```js
auth.forceLogout();
```

### `user: Object`

Get the current user data.

```js
console.log(auth.user);
```

## `loggedIn: boolean`

Get the current logged in state.

```js
console.log(auth.loggedIn);
```

## Usage as Vue Plugin

Install the plugin to your Vue app.

```js
// main.js
import {createApp} from 'vue';
import {authPlugin} from '@frontend/auth'; // 👈 import the plugin

const app = createApp(App);

app.use(authPlugin); // 👈 use the plugin

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
import {inject} from 'vue'

const auth = inject('auth')

// access the user
console.log(auth.user
```

Or, by importing `auth` function, which do the same thing as above.

```js
import {auth as useAuth} from '@frontend/auth';

const auth = useAuth();

// access the user
console.log(auth.user);
```

## Options

This is complete default options object:

```js
const defaultOptions = {
  endpoints: {
    login: {
      url: '/login',
      method: 'post',
    },
    logout: {
      url: '/logout',
      method: 'delete',
    },
    user: {
      url: '/my/profile',
      method: 'get',
    },
  },
  token: {
    property: 'data.token',
    type: 'Bearer',
    storageName: 'auth.token',
    autoDecode: true,
    name: 'Authorization',
  },
  user: {
    autoFetch: true,
    property: 'data',
    storageName: 'auth.user',
  },
  moduleName: 'auth',
  expiredStorage: 'auth.expired',
};
```

## License

Copyright @ GITS Indonesia. 2021-Present.
