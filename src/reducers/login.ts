import * as Immutable from "immutable";
import { Action, combineReducers, Dispatch } from "redux";
import { createAction, handleActions } from "redux-actions";

export enum Mode {
  EnteringEmail,
  SubmittingEmail,
  EnteringCode,
  SubmittingCode,
}

export class State extends Immutable.Record({
  code: "",
  email: "",
  mode: Mode.EnteringEmail,
}) {
  public code: string;
  public email: string;
  public mode: Mode;
}

export const UPDATE_EMAIL = "brdgme/login/UPDATE_EMAIL";
export const UPDATE_CODE = "brdgme/login/UPDATE_CODE";
export const UPDATE_MODE = "brdgme/login/UPDATE_MODE";
export const SUBMIT_EMAIL = "brdgme/login/SUBMIT_EMAIL";
export const SUBMIT_EMAIL_SUCCESS = "brdgme/login/SUBMIT_EMAIL_SUCCESS";
export const SUBMIT_EMAIL_FAIL = "brdgme/login/SUBMIT_EMAIL_FAIL";
export const SUBMIT_CODE = "brdgme/login/SUBMIT_CODE";
export const SUBMIT_CODE_SUCCESS = "brdgme/login/SUBMIT_CODE_SUCCESS";
export const SUBMIT_CODE_FAIL = "brdgme/login/SUBMIT_CODE_FAIL";

export const updateEmail = createAction<string>(UPDATE_EMAIL);
export const updateCode = createAction<string>(UPDATE_CODE);
export const updateMode = createAction<Mode>(UPDATE_MODE);
export const submitEmail = createAction<string>(SUBMIT_EMAIL);
export const submitEmailSuccess = createAction(SUBMIT_EMAIL_SUCCESS);
export const submitEmailFail = createAction(SUBMIT_EMAIL_FAIL);
export const submitCode = createAction(
  SUBMIT_CODE,
  (email: string, code: string) => ({ email, code }),
);
export const submitCodeSuccess = createAction<string>(SUBMIT_EMAIL_SUCCESS);
export const submitCodeFail = createAction(SUBMIT_CODE_FAIL);

export const reducer = handleActions({
  [UPDATE_EMAIL]: (state, action) => state.set("email", action.payload),
  [UPDATE_CODE]: (state, action) => state.set("code", action.payload),
  [UPDATE_MODE]: (state, action) => state.set("mode", action.payload),
  [SUBMIT_EMAIL]: (state, action) => state.set("mode", Mode.SubmittingEmail),
  [SUBMIT_EMAIL_SUCCESS]: (state, action) => state.set("mode", Mode.EnteringCode),
  [SUBMIT_EMAIL_FAIL]: (state, action) => state.set("mode", Mode.EnteringEmail),
  [SUBMIT_CODE]: (state, action) => state.set("mode", Mode.SubmittingCode),
  [SUBMIT_CODE_FAIL]: (state, action) => state.set("mode", Mode.EnteringCode),
}, new State());
