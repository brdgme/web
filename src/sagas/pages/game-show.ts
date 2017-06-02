import { call, Effect, put, select, takeEvery, takeLatest } from "redux-saga/effects";

import * as Command from "../../command";
import { State as AppState } from "../../reducers";
import * as GameShow from "../../reducers/pages/game-show";

export function* sagas(): IterableIterator<Effect> {
  yield takeLatest(GameShow.UPDATE_COMMAND, autoComplete);
}

function* autoComplete(action: GameShow.IUpdateCommand): IterableIterator<Effect> {
  const { command, commandPos } = yield select((appState: AppState) => ({
    command: appState.pages.gameShow.command,
    commandPos: appState.pages.gameShow.commandPos,
  }));
  if (!action.payload.commandSpec) {
    return;
  }
  const commandSpec = action.payload.commandSpec.toJS();
  const fullCommand = Command.parse(action.payload.command, 0, commandSpec);
  console.log(Command.suggestions(fullCommand, action.payload.commandPos));
  let start = Command.startOfMatch(fullCommand, action.payload.commandPos);
  if (start === undefined) {
    // Use the end of the last match, or the start of the current word if
    // the last match ends at the end of the last word.
    const lastMatch = Command.lastMatch(fullCommand);
    if (!action.payload.command.substr(lastMatch.offset, action.payload.commandPos - lastMatch.offset).match(/\s/)) {
      start = lastMatch.offset;
    }
  }
  if (start !== undefined) {
    const upToStart = Command.parse(
      action.payload.command.substr(0, start), 0, commandSpec);
    console.log(Command.suggestions(upToStart, start));
  }
}
