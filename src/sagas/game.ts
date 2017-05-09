import { Action } from "redux-actions";
import { call, Effect, put, select, takeEvery, takeLatest } from "redux-saga/effects";
import * as http from "../http";
import { State as AppState } from "../reducers";
import * as Game from "../reducers/game";

export function* sagas(): IterableIterator<Effect> {
  yield takeEvery(Game.FETCH_ACTIVE_GAMES, fetchActiveGames);
  yield takeEvery(Game.FETCH_GAME, fetchGame);
  yield takeEvery(Game.SUBMIT_COMMAND, submitCommand);
}

function* fetchActiveGames(action: Action<{}>): IterableIterator<Effect> {
  const token: string = yield select((state: AppState) => state.session.token);
  if (token === undefined) {
    return;
  }
  try {
    const activeGames = yield call(http.fetchActiveGames, token);
    yield put(Game.fetchActiveGamesSuccess(activeGames));
  } catch (e) {
    yield put(Game.fetchActiveGamesFail());
  }
}

function* fetchGame(action: Action<string>): IterableIterator<Effect> {
  const token: string = yield select((state: AppState) => state.session.token);
  if (token === undefined) {
    return;
  }
  try {
    const game = yield call(http.fetchGame, action.payload, token);
    yield put(Game.fetchGameSuccess(game));
  } catch (e) {
    yield put(Game.fetchGameFail());
  }
}

function* submitCommand(action: Action<Game.ISubmitCommand>): IterableIterator<Effect> {
  const token: string = yield select((state: AppState) => state.session.token);
  if (token === undefined) {
    return;
  }
  try {
    const game = yield call(
      http.submitGameCommand,
      action.payload!.gameId,
      action.payload!.command,
      token,
    );
    yield put(Game.submitCommandSuccess(game));
  } catch (e) {
    yield put(Game.submitCommandFail(e.response && e.response.text || e.message));
  }
}