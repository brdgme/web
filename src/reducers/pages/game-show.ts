import * as Immutable from "immutable";
import { createAction, handleActions } from "redux-actions";

export class State extends Immutable.Record({
  command: "",
}) {
  public command: string;
}

export const UPDATE_COMMAND = "brdgme/reducers/pages/game-show/UPDATE_COMMAND";

export const updateCommand = createAction<string>(UPDATE_COMMAND);

export const reducer = handleActions({
  [UPDATE_COMMAND]: (state, action) => state.set("command", action.payload),
}, new State());
