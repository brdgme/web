import { Action } from "redux-actions";
import { call, Effect, put, takeEvery, takeLatest } from "redux-saga/effects";

import * as http from "../http";
import * as Login from "../reducers/login";
import * as Session from "../reducers/session";

export function* sagas(): IterableIterator<Effect> {
  yield takeEvery(Login.SUBMIT_EMAIL, submitLoginEmail),
  yield takeEvery(Login.SUBMIT_CODE, submitLoginCode);
}

function* submitLoginEmail(action: Action<string>): IterableIterator<Effect> {
  try {
    yield call(http.submitLoginEmail, action.payload || "");
    yield put(Login.submitEmailSuccess());
  } catch (e) {
    yield put(Login.submitEmailFail());
  }
}

function* submitLoginCode(action: Action<{ code: string, email: string }>): IterableIterator<Effect> {
  try {
    const token: string = yield call(
      http.submitLoginCode,
      action.payload!.email,
      action.payload!.code,
    );
    yield put(Session.updateToken(token));
  } catch (e) {
    yield put(Login.submitCodeFail());
  }
}
