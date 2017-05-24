import * as Immutable from "immutable";
import { combineReducers } from "redux-immutable";

import * as GameShow from "./game-show";
import * as Login from "./login";

export class State extends Immutable.Record({
  gameShow: new GameShow.State(),
  login: new Login.State(),
}) {
  public gameShow: GameShow.State;
  public login: Login.State;
}

export const reducer = combineReducers<State>({
  gameShow: GameShow.reducer,
  login: Login.reducer,
});
