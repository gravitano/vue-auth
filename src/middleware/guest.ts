import {MiddlewareParams} from '../../types';

export const guestMiddleware = ({
  loggedIn,
  next,
  options,
}: MiddlewareParams) => {
  if (loggedIn?.value) {
    next(options.redirect.home);
  } else {
    next();
  }
};
