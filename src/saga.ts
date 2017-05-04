import { call, put, takeEvery, takeLatest, Effect } from 'redux-saga/effects';
import { Action } from 'redux-actions';
import * as http from './http';
import * as Login from './reducers/login';

export default function* mySaga() {
  yield takeEvery(Login.SUBMIT_EMAIL, submitLoginEmail);
}

function* submitLoginEmail(action: Action<string>): IterableIterator<Effect> {
  try {
    yield call(http.submitLoginEmail, action.payload!);
    yield put(Login.submitEmailSuccess());
  } catch (e) {
    yield put(Login.submitEmailFail());
  }
}

function* submitLoginCode(action: Action<{ email: string, code: string }>): IterableIterator<Effect> {
  try {
    const auth: http.SubmitLoginCodeResponse = yield call(http.submitLoginCode, action.payload!.email, action.payload!.code);
    yield put(Login.submitCodeSuccess(auth.user_id, auth.token));
  } catch (e) {
    yield put(Login.submitCodeFail());
  }
}