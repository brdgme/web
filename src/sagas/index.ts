import { call, Effect, fork, put, takeEvery, takeLatest } from "redux-saga/effects";

import { sagas as gameSagas } from "./game";
import { sagas as loginSagas } from "./login";
import { sagas as sessionSagas } from "./session";

export default function* sagas() {
  yield [
    fork(loginSagas),
    fork(sessionSagas),
    fork(gameSagas),
  ];
}
