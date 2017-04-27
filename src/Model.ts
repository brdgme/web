import { CommandSpec } from './Command';

export interface Game {
  id: string,
  created_at: string,
  updated_at: string,
  game_version_id: string,
  is_finished: boolean,
}

export interface GameType {
  id: string,
  created_at: string,
  updated_at: string,
  name: string,
}

export interface GameVersion {
  id: string,
  created_at: string,
  updated_at: string,
  game_type_id: string,
  name: string,
  is_public: boolean,
  is_deprecated: boolean,
}

export interface GamePlayer {
  id: string,
  created_at: string,
  updated_at: string,
  user_id: string,
  game_id: string,
  position: number,
  color: string,
  has_accepted: boolean,
  is_turn: boolean,
  is_read: boolean,
  is_winner: boolean,
}

export interface User {
  id: string,
  created_at: string,
  updated_at: string,
  name: string,
}

export interface GamePlayerUser {
  game_player: GamePlayer,
  user: User,
}

export interface GameExtended {
  game: Game,
  game_type: GameType,
  game_version: GameVersion,
  game_players: GamePlayerUser[],
}

export interface GameVersionType {
  game_version: GameVersion,
  game_type: GameType,
}

export interface Session {
  email: string,
  userId: string,
  token: string,
  logout: () => void,
}

export interface GameLog {
  id: string,
  created_at: string,
  updated_at: string,
  logged_at: string,
  game_id: string,
  is_public: boolean,
  body: string,
}

export interface GameLogHTML {
  game_log: GameLog,
  html: string,
}

export interface GameShowAPI {
  game: Game,
  game_type: GameType,
  game_version: GameVersion,
  game_players: GamePlayerUser[],
  game_logs: GameLogHTML[],
  game_html: string,
  pub_state: string,
  command_spec?: CommandSpec,
}