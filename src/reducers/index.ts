import * as Immutable from "immutable";
import * as Redux from "redux";
import { combineReducers } from "redux-immutable";

import * as Game from "./game";
import * as Pages from "./pages";
import * as Session from "./session";
import * as WS from "./ws";

export const CLEAR_PAGE_STATE = "brdgme/CLEAR_PAGE_STATE";

export interface IClearPageState {
  type: typeof CLEAR_PAGE_STATE;
}
export const clearPageState = (): IClearPageState => ({
  type: CLEAR_PAGE_STATE,
});

export class State extends Immutable.Record({
  game: new Game.State(),
  pages: new Pages.State(),
  session: new Session.State(),
  ws: new WS.State(),
}) {
  public game: Game.State;
  public pages: Pages.State;
  public session: Session.State;
  public ws: WS.State;
}

const childrenReducer = combineReducers<State>({
  game: Game.reducer,
  pages: Pages.reducer,
  session: Session.reducer,
  ws: WS.reducer,
});

export type Action = IClearPageState;

export function reducer(state: State = new State(), action: Action): State {
  state = childrenReducer(state, action);
  switch (action.type) {
    case CLEAR_PAGE_STATE: return state.remove("pages");
    default: return state;
  }
}
