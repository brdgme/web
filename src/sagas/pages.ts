import { Effect, fork } from "redux-saga/effects";

import { sagas as gameShowSagas } from "./pages/game-show";

export function* sagas(): IterableIterator<Effect[]> {
  yield [
    fork(gameShowSagas),
  ];
}
