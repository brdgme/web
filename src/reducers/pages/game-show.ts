import * as Immutable from "immutable";
import { createAction, handleActions } from "redux-actions";

import * as Game from "../game";

export class State extends Immutable.Record({
  command: "",
  submittingCommand: false,
  commandError: undefined,
}) {
  public command: string;
  public submittingCommand: boolean;
  public commandError?: string;
}

export const UPDATE_COMMAND = "brdgme/reducers/pages/game-show/UPDATE_COMMAND";

export const updateCommand = createAction<string>(UPDATE_COMMAND);

export const reducer = handleActions({
  [UPDATE_COMMAND]: (state, action) => state.set("command", action.payload),
  [Game.SUBMIT_COMMAND]: (state, action) => state.set("submittingCommand", true),
  [Game.SUBMIT_COMMAND_SUCCESS]: (state, action) => state
    .set("submittingCommand", false)
    .set("command", "")
    .remove("commandError"),
  [Game.SUBMIT_COMMAND_FAIL]: (state, action) => state
    .set("commandError", action.payload)
    .set("submittingCommand", false),
}, new State());
