import * as Immutable from "immutable";
import { Action, combineReducers, Dispatch } from "redux";
import { createAction, handleActions } from "redux-actions";

import * as Login from "./login";

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

export const updateToken = createAction<string>(UPDATE_TOKEN);
export const clearToken = createAction(CLEAR_TOKEN);
export const updatePath = createAction<string>(UPDATE_PATH);

export const reducer = handleActions({
  [UPDATE_TOKEN]: (state, action) => state.set("token", action.payload!),
  [CLEAR_TOKEN]: (state, action) => state.remove("token"),
  [UPDATE_PATH]: (state, action) => state.set("path", action.payload),
}, new State());
