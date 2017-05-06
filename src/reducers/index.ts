import * as Immutable from "immutable";
import * as Redux from "redux";
import { createAction, handleActions } from "redux-actions";
import { combineReducers } from "redux-immutable";

import * as Game from "./game";
import * as Login from "./login";
import * as Pages from "./pages";
import * as Session from "./session";

export const CLEAR_PAGE_STATE = "brdgme/CLEAR_PAGE_STATE";

export const clearPageState = createAction(CLEAR_PAGE_STATE);

export class State extends Immutable.Record({
  game: new Game.State(),
  login: new Login.State(),
  pages: new Pages.State(),
  session: new Session.State(),
}) {
  public game: Game.State;
  public login: Login.State;
  public pages: Pages.State;
  public session: Session.State;
}

const childrenReducer = combineReducers<State>({
  game: Game.reducer,
  login: Login.reducer,
  pages: Pages.reducer,
  session: Session.reducer,
});

export function reducer(state: State = new State(), action: Redux.Action): State {
  state = childrenReducer(state, action);
  switch (action.type) {
    case CLEAR_PAGE_STATE: return state.remove("pages") as State;
    default: return state;
  }
}
