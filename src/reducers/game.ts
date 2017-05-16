import * as Immutable from "immutable";

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
export const SUBMIT_COMMAND = "brdgme/game/SUBMIT_COMMAND";
export const SUBMIT_COMMAND_SUCCESS = "brdgme/game/SUBMIT_COMMAND_SUCCESS";
export const SUBMIT_COMMAND_FAIL = "brdgme/game/SUBMIT_COMMAND_FAIL";

export interface IFetchActiveGames {
  type: typeof FETCH_ACTIVE_GAMES;
}
export const fetchActiveGames = (): IFetchActiveGames => ({
  type: FETCH_ACTIVE_GAMES,
});

export interface IFetchActiveGamesSuccess {
  type: typeof FETCH_ACTIVE_GAMES_SUCCESS;
  payload: Model.IGameExtended[];
}
export const fetchActiveGamesSuccess =
  (games: Model.IGameExtended[]): IFetchActiveGamesSuccess => ({
    type: FETCH_ACTIVE_GAMES_SUCCESS,
    payload: games,
  });

export interface IFetchActiveGamesFail {
  type: typeof FETCH_ACTIVE_GAMES_FAIL;
}
export const fetchActiveGamesFail = (): IFetchActiveGamesFail => ({
  type: FETCH_ACTIVE_GAMES_FAIL,
});

export interface IFetchGame {
  type: typeof FETCH_GAME;
  payload: string;
}
export const fetchGame = (id: string): IFetchGame => ({
  type: FETCH_GAME,
  payload: id,
});

export interface IFetchGameSuccess {
  type: typeof FETCH_GAME_SUCCESS;
  payload: Model.IGameExtended;
}
export const fetchGameSuccess =
  (game: Model.IGameExtended): IFetchGameSuccess => ({
    type: FETCH_GAME_SUCCESS,
    payload: game,
  });

export interface IFetchGameFail {
  type: typeof FETCH_GAME_FAIL;
}
export const fetchGameFail = (): IFetchGameFail => ({ type: FETCH_GAME_FAIL });

export interface IUpdateGames {
  type: typeof UPDATE_GAMES;
  payload: Immutable.List<Records.GameExtended>;
}
export const updateGames =
  (games: Immutable.List<Records.GameExtended>): IUpdateGames => ({
    type: UPDATE_GAMES,
    payload: games,
  });

export interface ISubmitCommand {
  type: typeof SUBMIT_COMMAND;
  payload: {
    gameId: string;
    command: string;
  };
}
export const submitCommand =
  (gameId: string, command: string): ISubmitCommand => ({
    type: SUBMIT_COMMAND,
    payload: { gameId, command },
  });

export interface ISubmitCommandSuccess {
  type: typeof SUBMIT_COMMAND_SUCCESS;
  payload: Records.GameExtended;
}
export const submitCommandSuccess =
  (game: Records.GameExtended): ISubmitCommandSuccess => ({
    type: SUBMIT_COMMAND_SUCCESS,
    payload: game,
  });

export interface ISubmitCommandFail {
  type: typeof SUBMIT_COMMAND_FAIL;
  payload: string;
}
export const submitCommandFail = (error: string): ISubmitCommandFail => ({
  type: SUBMIT_COMMAND_FAIL,
  payload: error,
});

export type Action
  = IFetchActiveGames
  | IFetchActiveGamesSuccess
  | IFetchActiveGamesFail
  | IFetchGame
  | IFetchGameSuccess
  | IFetchGameFail
  | IUpdateGames
  | ISubmitCommand
  | ISubmitCommandSuccess
  | ISubmitCommandFail
  ;

export function reducer(state = new State(), action: Action): State {
  switch (action.type) {
    case FETCH_ACTIVE_GAMES_SUCCESS: return state.updateGames(
      Records.GameExtended.fromJSList(action.payload));
    case FETCH_GAME_SUCCESS: return state.updateGames(
      Records.GameExtended.fromJSList([action.payload]));
    case UPDATE_GAMES: return state.updateGames(action.payload);
    case SUBMIT_COMMAND_SUCCESS: return state.updateGames(
      Records.GameExtended.fromJSList([action.payload]));
    default: return state;
  }
}
