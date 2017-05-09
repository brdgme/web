import { Action } from "redux-actions";
import { call, Effect, put, takeEvery, takeLatest } from "redux-saga/effects";

import * as http from "../http";
import * as App from "../reducers";
import * as Login from "../reducers/login";
import * as Session from "../reducers/session";

export const LS_AUTH_TOKEN_OFFSET = "token";

export function* sagas(): IterableIterator<Effect> {
  yield takeEvery(Login.SUBMIT_CODE_SUCCESS, loginSuccess);
  yield takeEvery(Session.UPDATE_PATH, updatePath);
  yield takeEvery(Session.UPDATE_TOKEN, updateToken);
}

function* loginSuccess(action: Action<string>): IterableIterator<Effect> {
  yield put(Session.updateToken(action.payload!));
}

function* updatePath(action: Action<string>): IterableIterator<Effect> {
  yield put(App.clearPageState());
  window.location.hash = action.payload!;
}

function* updateToken(action: Action<string>): IterableIterator<Effect> {
  localStorage.setItem(LS_AUTH_TOKEN_OFFSET, action.payload!);
  yield put(Session.updatePath("/"));
}
