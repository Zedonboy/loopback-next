// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: example-passport-oauth2-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  asAuthStrategy,
  AuthenticationStrategy,
  UserIdentityService,
} from '@loopback/authentication';
import {StrategyAdapter} from '@loopback/authentication-passport';
import {Profile} from 'passport';
import {Strategy, StrategyOption} from 'passport-facebook';
import {bind, inject} from '@loopback/context';
import {UserServiceBindings} from '../services';
import {extensionFor} from '@loopback/core';
import {securityId, UserProfile} from '@loopback/security';
import {User} from '../models';
import {Request, RedirectRoute} from '@loopback/rest';
import {PassportAuthenticationBindings} from './oauth2';

@bind(
  asAuthStrategy,
  extensionFor(PassportAuthenticationBindings.OAUTH2_STRATEGY),
)
export class FaceBookOauth2Authorization implements AuthenticationStrategy {
  name = 'oauth2-facebook';
  protected strategy: StrategyAdapter<User>;
  passportstrategy: Strategy;

  /**
   * create an oauth2 strategy for facebook
   */
  constructor(
    @inject(UserServiceBindings.PASSPORT_USER_IDENTITY_SERVICE)
    public userService: UserIdentityService<Profile, User>,
    @inject('facebookOAuth2Options')
    public facebookOptions: StrategyOption,
  ) {
    this.passportstrategy = new Strategy(
      facebookOptions,
      this.verify.bind(this),
    );
    this.strategy = new StrategyAdapter(
      this.passportstrategy,
      this.name,
      this.mapProfile.bind(this),
    );
  }

  /**
   * verify function for the oauth2 strategy
   *
   * @param accessToken
   * @param refreshToken
   * @param profile
   * @param done
   */
  verify(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    done: (error: any, user?: any, info?: any) => void,
  ) {
    // look up a linked user for the profile
    this.userService
      .findOrCreateUser(profile)
      .then((user: User) => {
        done(null, user);
      })
      .catch((err: Error) => {
        done(err);
      });
  }

  /**
   * authenticate a request
   * @param request
   */
  async authenticate(request: Request): Promise<UserProfile | RedirectRoute> {
    return this.strategy.authenticate(request);
  }

  /**
   * map passport profile to user profile
   * @param user
   */
  mapProfile(user: User): UserProfile {
    const userProfile: UserProfile = {
      [securityId]: '' + user.id,
      profile: {
        ...user,
      },
    };
    return userProfile;
  }
}
