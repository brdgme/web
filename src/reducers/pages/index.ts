import * as Immutable from "immutable";
import { combineReducers } from "redux-immutable";

import * as GameShow from "./game-show";

export class State extends Immutable.Record({
  gameShow: new GameShow.State(),
}) {
  public gameShow: GameShow.State;
}

export const reducer = combineReducers<State>({
  gameShow: GameShow.reducer,
});
