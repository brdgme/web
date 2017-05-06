import * as Immutable from "immutable";

export class User extends Immutable.Record({
  id: undefined,
  created_at: undefined,
  updated_at: undefined,
  name: undefined,
}) {
  public static fromJS(js: any): User {
    return new User(js);
  }

  public id: string;
  public created_at: string;
  public updated_at: string;
  public name: string;
}

export class GameType extends Immutable.Record({
  id: undefined,
  created_at: undefined,
  updated_at: undefined,
  name: undefined,
}) {
  public static fromJS(js: any): GameType {
    return new GameType(js);
  }

  public id: string;
  public created_at: string;
  public updated_at: string;
  public name: string;
}

export class GameVersion extends Immutable.Record({
  id: undefined,
  created_at: undefined,
  updated_at: undefined,
  game_type_id: undefined,
  name: undefined,
  is_public: undefined,
  is_deprecated: undefined,
}) {
  public static fromJS(js: any): GameType {
    return new GameType(js);
  }

  public id: string;
  public created_at: string;
  public updated_at: string;
  public game_type_id: string;
  public name: string;
  public is_public: boolean;
  public is_deprecated: boolean;
}

export class Game extends Immutable.Record({
  id: undefined,
  created_at: undefined,
  updated_at: undefined,
  game_version_id: undefined,
  is_finished: undefined,
}) {
  public static fromJS(js: any): Game {
    return new Game(js);
  }

  public id: string;
  public created_at: string;
  public updated_at: string;
  public game_version_id: string;
  public is_finished: boolean;
}

export class GamePlayer extends Immutable.Record({
  id: undefined,
  created_at: undefined,
  updated_at: undefined,
  game_id: undefined,
  user_id: undefined,
  position: undefined,
  color: undefined,
  has_accepted: undefined,
  is_turn: undefined,
  is_turn_at: undefined,
  last_turn_at: undefined,
  is_eliminated: undefined,
  is_winner: undefined,
  is_read: undefined,
  points: undefined,
}) {
  public static fromJS(js: any): GamePlayer {
    return new GamePlayer(js);
  }

  public id: string;
  public created_at: string;
  public updated_at: string;
  public game_id: string;
  public user_id: string;
  public position: number;
  public color: string;
  public has_accepted: boolean;
  public is_turn: boolean;
  public is_turn_at: string;
  public last_turn_at: string;
  public is_eliminated: boolean;
  public is_winner: boolean;
  public is_read: boolean;
  public points: number;
}

export class GameLog extends Immutable.Record({
  id: undefined,
  created_at: undefined,
  updated_at: undefined,
  game_id: undefined,
  body: undefined,
  is_public: undefined,
  logged_at: undefined,
}) {
  public static fromJS(js: any): GameLog {
    return new GameLog(js);
  }

  public id: string;
  public created_at: string;
  public updated_at: string;
  public game_id: string;
  public body: string;
  public is_public: boolean;
  public logged_at: string;
}

export class GameLogRendered extends Immutable.Record({
  game_log: undefined,
  html: undefined,
}) {
  public static fromJS(js: any): GameLogRendered {
    return new GameLogRendered({
      game_log: GameLog.fromJS(js.game_log),
      html: js.html,
    });
  }

  public game_log: GameLog;
  public html: string;
}

export class GamePlayerUser extends Immutable.Record({
  game_player: undefined,
  user: undefined,
}) {
  public static fromJS(js: any): GamePlayerUser {
    return new GamePlayerUser({
      game_player: GamePlayer.fromJS(js.game_player),
      user: User.fromJS(js.user),
    });
  }

  public game_player: GamePlayer;
  public user: User;
}

export class GameExtended extends Immutable.Record({
  game: undefined,
  game_type: undefined,
  game_version: undefined,
  game_players: undefined,
  game_logs: undefined,
  pub_state: undefined,
  html: undefined,
  command_spec: undefined,
}) {
  public static fromJS(js: any): GameExtended {
    return new GameExtended({
      game: Game.fromJS(js.game),
      game_type: GameType.fromJS(js.game_type),
      game_version: GameVersion.fromJS(js.game_version),
      game_players: Immutable.List(js.game_players.map(GamePlayerUser.fromJS)),
      game_logs: js.game_logs && Immutable.List(js.game_logs.map(GameLogRendered.fromJS)),
      pub_state: js.pub_state,
      html: js.html,
      command_spec: js.command_spec,
    });
  }

  public static fromJSList(js: any): Immutable.List<GameExtended> {
    return Immutable.List(js.map(GameExtended.fromJS)) as Immutable.List<GameExtended>;
  }

  public game: Game;
  public game_type: GameType;
  public game_version: GameVersion;
  public game_players: Immutable.List<GamePlayerUser>;
  public game_logs?: Immutable.List<GameLogRendered>;
  public pub_state: string;
  public html?: string;
  public command_spec?: string;
}
