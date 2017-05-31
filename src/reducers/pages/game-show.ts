import * as Immutable from "immutable";

import * as Game from "../game";

export class State extends Immutable.Record({
  command: "",
  commandPos: 0,
  submittingCommand: false,
  commandError: undefined,
  hideLogsAt: undefined,
}) {
  public command: string;
  public commandPos: number;
  public submittingCommand: boolean;
  public commandError?: string;
  public hideLogsAt?: string;
}

export const UPDATE_COMMAND = "brdgme/pages/game-show/UPDATE_COMMAND";
export const UPDATE_COMMAND_POS = "brdgme/pages/game-show/UPDATE_COMMAND_POS";
export const HIDE_LOGS = "brdgme/pages/game-show/HIDE_LOGS";

export interface IUpdateCommand {
  type: typeof UPDATE_COMMAND;
  payload: string;
}
export const updateCommand = (command: string): IUpdateCommand => ({
  type: UPDATE_COMMAND,
  payload: command,
});

export interface IUpdateCommandPos {
  type: typeof UPDATE_COMMAND_POS;
  payload: number;
}
export const updateCommandPos = (commandPos: number): IUpdateCommandPos => ({
  type: UPDATE_COMMAND_POS,
  payload: commandPos,
});

export interface IHideLogs {
  type: typeof HIDE_LOGS;
  payload: string;
}
export const hideLogs = (at: string): IHideLogs => ({
  type: HIDE_LOGS,
  payload: at,
});

type Action = IUpdateCommand | IUpdateCommandPos | IHideLogs | Game.Action;

export function reducer(state = new State(), action: Action): State {
  switch (action.type) {
    case UPDATE_COMMAND: return state.set("command", action.payload) as State;
    case UPDATE_COMMAND_POS: return state.set("commandPos", action.payload) as State;
    case HIDE_LOGS: return state.set("hideLogsAt", action.payload) as State;
    case Game.SUBMIT_COMMAND: return state.set("submittingCommand", true) as State;
    case Game.SUBMIT_COMMAND_SUCCESS: return state
      .set("submittingCommand", false)
      .set("command", "")
      .remove("commandError") as State;
    case Game.SUBMIT_COMMAND_FAIL: return state
      .set("commandError", action.payload)
      .set("submittingCommand", false) as State;
    default: return state;
  }
}
