import {registerAuthenticationStrategy} from '@loopback/authentication';
import {
  Application,
  Binding,
  Component,
  CoreBindings,
  inject,
} from '@loopback/core';
import {
  TokenServiceBindings,
  TokenServiceConstants,
  UserServiceBindings,
} from './keys';
import {UserCredentialsRepository, UserRepository} from './repositories';
import {MyUserService} from './services';
import {JWTAuthenticationStrategy} from './services/jwt.auth.strategy';
import {JWTService} from './services/jwt.service';

export class JWTAuthenticationComponent implements Component {
  bindings = [
    // token bindings
    Binding.bind(TokenServiceBindings.TOKEN_SECRET).to(
      TokenServiceConstants.TOKEN_SECRET_VALUE,
    ),
    Binding.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
    ),
    Binding.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService),

    // user bindings
    Binding.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService),
    Binding.bind(UserServiceBindings.USER_REPOSITORY_NAME).toClass(
      UserRepository,
    ),
    Binding.bind(UserServiceBindings.USER_CREDENTIALS_REPOSITORY_NAME).toClass(
      UserCredentialsRepository,
    ),
  ];
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    registerAuthenticationStrategy(app, JWTAuthenticationStrategy);
  }
}
