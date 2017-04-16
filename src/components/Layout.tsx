import * as React from "react";
import * as superagent from 'superagent';

import { Spinner } from './Spinner';

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

export interface LayoutProps {
  email: string,
  token: string,
  userId: string,
  path: string,
  onLogout: () => void,
}
export interface LayoutState {
  activeGames?: GameExtended[],
}

export class Layout extends React.Component<LayoutProps, LayoutState> {
  constructor(props?: LayoutProps, context?: any) {
    super(props, context);

    this.state = {};
  }

  componentDidMount() {
    this.fetchActiveGames();
  }

  fetchActiveGames() {
    superagent
      .get(`${process.env.API_SERVER}/game/my_active`)
      .auth(this.props.email, this.props.token)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) {
          if (res.unauthorized) {
            this.props.onLogout();
          } else {
            console.log(err, res);
          }
          return;
        }
        this.setState({
          activeGames: res.body.games,
        });

      });
  }

  render() {
    return (
      <div>
        <div>Logged in</div>
        <div>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            this.props.onLogout();
          }}>Logout</a>
        </div>
        {this.state.activeGames && <div>
          <ul>
            {this.state.activeGames.map((ag) =>
              <li>{ag.game_type.name} - {ag.game.id}</li>
            )}
          </ul>
        </div> || <div>
            <Spinner />
          </div>
        }
      </div>
    );
  }
}