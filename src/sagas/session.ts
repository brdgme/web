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
  yield takeEvery(Session.CLEAR_TOKEN, clearToken);
}

function* loginSuccess(action: Login.ISubmitCodeSuccess): IterableIterator<Effect> {
  yield put(Session.updateToken(action.payload));
}

function* updatePath(action: Session.IUpdatePath): IterableIterator<Effect> {
  yield put(App.clearPageState());
  window.location.hash = action.payload;
}

function* updateToken(action: Session.IUpdateToken): IterableIterator<Effect> {
  localStorage.setItem(LS_AUTH_TOKEN_OFFSET, action.payload);
  yield put(Session.updatePath("/"));
}

function* clearToken(action: Session.IClearToken): IterableIterator<Effect> {
  localStorage.removeItem(LS_AUTH_TOKEN_OFFSET);
}
