import { Action, Dispatch, combineReducers } from 'redux';
import { ThunkAction } from 'redux-thunk';
import * as superagent from 'superagent';
import * as Immutable from 'immutable';

export class AuthState extends Immutable.Record({
  email: '',
  userId: '',
  token: '',
}) {
  email: string;
  userId: string;
  token: string;
}

export class State extends Immutable.Record({
  path: '',
  auth: undefined,
}) {
  path: string;
  auth?: AuthState;
}

export const UPDATE_AUTH = "SESSION/UPDATE_AUTH";
export const CLEAR_AUTH = "SESSION/CLEAR_AUTH";

interface UpdateAuth extends Action {
  type: typeof UPDATE_AUTH,
  auth: AuthState,
}
export function updateAuth(auth: AuthState): UpdateAuth {
  return { type: UPDATE_AUTH, auth };
}

interface ClearAuth extends Action {
  type: typeof CLEAR_AUTH,
}
export function clearAuth(): ClearAuth {
  return { type: CLEAR_AUTH };
}

type SessionAction = UpdateAuth | ClearAuth;
export function reducer(state: State = new State(), action: SessionAction): State {
  switch (action.type) {
    case UPDATE_AUTH:
      return state.set('auth', action.auth) as State;
    case CLEAR_AUTH:
      return state.set('auth', undefined) as State;
    default:
      return state;
  }
}