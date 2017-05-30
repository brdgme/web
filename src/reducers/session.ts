import * as Immutable from "immutable";

import * as Records from "../records";
import * as Login from "./pages/login";

export class State extends Immutable.Record({
  token: undefined,
  path: "",
  user: undefined,
  gameVersionTypes: undefined,
}) {
  public token?: string;
  public path: string;
  public user?: Records.User;
  public gameVersionTypes?: Immutable.List<Records.GameVersionType>;
}

export const UPDATE_TOKEN = "brdgme/session/UPDATE_TOKEN";
export const CLEAR_TOKEN = "brdgme/session/CLEAR_TOKEN";
export const UPDATE_PATH = "brdgme/session/UPDATE_PATH";
export const UPDATE_USER = "brdgme/session/UPDATE_USER";
export const UPDATE_GAME_VERSION_TYPES = "brdgme/session/UPDATE_GAME_VERSION_TYPES";

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

export interface IUpdateUser {
  type: typeof UPDATE_USER;
  payload?: Records.User;
}
export const updateUser = (user?: Records.User): IUpdateUser => ({
  type: UPDATE_USER,
  payload: user,
});

export interface IUpdateGameVersionTypes {
  type: typeof UPDATE_GAME_VERSION_TYPES;
  payload: Immutable.List<Records.GameVersionType>;
}
export const updateGameVersionTypes =
  (gameVersionTypes: Immutable.List<Records.GameVersionType>): IUpdateGameVersionTypes => ({
    type: UPDATE_GAME_VERSION_TYPES,
    payload: gameVersionTypes,
  });

type Action
  = IUpdateToken
  | IClearToken
  | IUpdatePath
  | IUpdateUser
  | IUpdateGameVersionTypes
  ;

export function reducer(state = new State(), action: Action): State {
  switch (action.type) {
    case UPDATE_TOKEN: return state.set("token", action.payload) as State;
    case CLEAR_TOKEN: return state.remove("token") as State;
    case UPDATE_PATH: return state.set("path", action.payload) as State;
    case UPDATE_USER: return state.set("user", action.payload) as State;
    case UPDATE_GAME_VERSION_TYPES:
      return state.set("gameVersionTypes", action.payload) as State;
    default: return state;
  }
}
