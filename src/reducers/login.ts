import { Action, Dispatch, combineReducers } from 'redux';
import { ThunkAction } from 'redux-thunk';
import * as superagent from 'superagent';
import * as Immutable from 'immutable';

import * as Session from './session';

export enum Mode {
  EnteringEmail,
  SubmittingEmail,
  EnteringCode,
  SubmittingCode,
}

export class State extends Immutable.Record({
  email: '',
  code: '',
  mode: Mode.EnteringEmail,
}) {
  email: string;
  code: string;
  mode: Mode;
}

export const UPDATE_EMAIL = "LOGIN/UPDATE_EMAIL";
export const UPDATE_CODE = "LOGIN/UPDATE_CODE";
export const UPDATE_MODE = "LOGIN/UPDATE_MODE";

interface UpdateEmail extends Action {
  type: typeof UPDATE_EMAIL,
  email: string,
}
export function updateEmail(email: string): UpdateEmail {
  return { type: UPDATE_EMAIL, email };
}

interface UpdateCode extends Action {
  type: typeof UPDATE_CODE,
  code: string,
}
export function updateCode(code: string): UpdateCode {
  return { type: UPDATE_CODE, code };
}

interface UpdateMode extends Action {
  type: typeof UPDATE_MODE,
  mode: Mode,
}
export function updateMode(mode: Mode): UpdateMode {
  return { type: UPDATE_MODE, mode };
}

interface SubmitEmail extends ThunkAction<void, State, {}> { }
export function submitEmail(email: string): SubmitEmail {
  return (dispatch) => {
    dispatch(updateMode(Mode.SubmittingEmail));
    superagent
      .post(`${process.env.API_SERVER}/auth`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({ email })
      .end((err, res) => {
        if (err || !res.ok) {
          dispatch(updateMode(Mode.EnteringEmail));
          alert('failed to request login code, please check your email and try again');
        } else {
          dispatch(updateMode(Mode.EnteringCode));
        }
      });
  };
}

interface SubmitCode extends ThunkAction<void, State, {}> { }
export function submitCode(email: string, code: string): SubmitCode {
  return (dispatch, getState) => {
    dispatch(updateMode(Mode.SubmittingCode));
    let state = getState();
    superagent
      .post(`${process.env.API_SERVER}/auth/confirm`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({ email, code })
      .end((err, res) => {
        if (err || !res.ok) {
          dispatch(updateMode(Mode.EnteringCode));
          alert('failed to confirm code, please check it is correct and try again');
        } else {
          dispatch(Session.updateAuth(new Session.AuthState({
            email,
            userId: res.body.user_id,
            token: res.body.token,
          })));
        }
      });
  };
}

type LoginAction = UpdateEmail | UpdateCode | UpdateMode;
export function reducer(state: State = new State(), action: LoginAction) {
  switch (action.type) {
    case UPDATE_EMAIL:
      return state.set('email', action.email);
    case UPDATE_CODE:
      return state.set('code', action.code);
    case UPDATE_MODE:
      return state.set('mode', action.mode);
    default:
      return state;
  }
}