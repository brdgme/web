import * as Immutable from "immutable";
import { Action, combineReducers, Dispatch } from "redux";
import { createAction, handleActions } from "redux-actions";

import * as Model from "../model";
import * as Records from "../records";

export class State extends Immutable.Record({
  games: Immutable.Map(),
}) {
  public games: Immutable.Map<string, Records.GameExtended>;

  public updateGames(newGames: Immutable.List<Records.GameExtended>): this {
    return this.set("games", this.games.withMutations((games) => {
      newGames.forEach((g) => {
        if (g === undefined) {
          return;
        }
        const existing: Records.GameExtended | undefined = games.get(g.game.id);
        if (existing === undefined || existing.game.updated_at <= g.game.updated_at) {
          games.set(g.game.id, g);
        }
      });
    })) as this;
  }
}

export const FETCH_ACTIVE_GAMES = "brdgme/game/FETCH_ACTIVE_GAMES";
export const FETCH_ACTIVE_GAMES_SUCCESS = "brdgme/game/FETCH_ACTIVE_GAMES_SUCCESS";
export const FETCH_ACTIVE_GAMES_FAIL = "brdgme/game/FETCH_ACTIVE_GAMES_FAIL";
export const FETCH_GAME = "brdgme/game/FETCH_GAME";
export const FETCH_GAME_SUCCESS = "brdgme/game/FETCH_GAME_SUCCESS";
export const FETCH_GAME_FAIL = "brdgme/game/FETCH_GAME_FAIL";
export const UPDATE_GAMES = "brdgme/game/UPDATE_GAMES";

export const fetchActiveGames = createAction(FETCH_ACTIVE_GAMES);
export const fetchActiveGamesSuccess = createAction<Model.IGameExtended[]>(FETCH_ACTIVE_GAMES_SUCCESS);
export const fetchActiveGamesFail = createAction(FETCH_ACTIVE_GAMES_FAIL);
export const fetchGame = createAction<string>(FETCH_GAME);
export const fetchGameSuccess = createAction<Model.IGameExtended>(FETCH_GAME_SUCCESS);
export const fetchGameFail = createAction(FETCH_GAME_FAIL);
export const updateGames = createAction<Immutable.List<Records.GameExtended>>(UPDATE_GAMES);

export const reducer = handleActions<State, any>({
  [FETCH_ACTIVE_GAMES_SUCCESS]: (state, action) => state.updateGames(
    Records.GameExtended.fromJSList(action.payload),
  ),
  [FETCH_GAME_SUCCESS]: (state, action) => state.updateGames(
    Records.GameExtended.fromJSList([action.payload]),
  ),
  [UPDATE_GAMES]: (state, action) => state.updateGames(
    action.payload! as Immutable.List<Records.GameExtended>,
  ),
}, new State());
