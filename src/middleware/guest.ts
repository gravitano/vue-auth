import { MiddlewareParams } from '../types/index'

export const guestMiddleware = ({ loggedIn, next, options }: MiddlewareParams) => {
  if (loggedIn.value) {
    next(options.redirect.home);
  } else {
    next();
  }
}