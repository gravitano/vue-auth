import {MiddlewareParams} from '../../types';

export const requiresAuthMiddleware = ({
  loggedIn,
  next,
  options,
}: MiddlewareParams) => {
  if (!loggedIn.value) {
    next(options.redirect.login);
  } else {
    next();
  }
};
