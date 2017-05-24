import * as Immutable from "immutable";

import * as Login from "./pages/login";

export class State extends Immutable.Record({
  token: undefined,
  path: "",
}) {
  public token?: string;
  public path: string;
}

export const UPDATE_TOKEN = "brdgme/session/UPDATE_TOKEN";
export const CLEAR_TOKEN = "brdgme/session/CLEAR_TOKEN";
export const UPDATE_PATH = "brdgme/session/UPDATE_PATH";

export interface IUpdateToken {
  type: typeof UPDATE_TOKEN;
  payload: string;
}
export const updateToken = (token: string): IUpdateToken => ({
  type: UPDATE_TOKEN,
  payload: token,
});

export interface IClearToken { type: typeof CLEAR_TOKEN; }
export const clearToken = (): IClearToken => ({ type: CLEAR_TOKEN });

export interface IUpdatePath {
  type: typeof UPDATE_PATH;
  payload: string;
}
export const updatePath = (path: string): IUpdatePath => ({
  type: UPDATE_PATH,
  payload: path,
});

type Action
  = IUpdateToken
  | IClearToken
  | IUpdatePath
  ;

export function reducer(state = new State(), action: Action): State {
  switch (action.type) {
    case UPDATE_TOKEN: return state.set("token", action.payload) as State;
    case CLEAR_TOKEN: return state.remove("token") as State;
    case UPDATE_PATH: return state.set("path", action.payload) as State;
    default: return state;
  }
}
