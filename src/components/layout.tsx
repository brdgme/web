import * as Immutable from "immutable";
import * as React from "react";
import * as ReactRedux from "react-redux";
import * as Redux from "redux";

import * as Records from "../records";
import { State as AppState } from "../reducers";
import * as Game from "../reducers/game";
import * as Session from "../reducers/session";
import Player from "./player";
import { Spinner } from "./spinner";

export interface IPropValues {
  user?: Records.User;
  activeGames?: Immutable.List<Records.GameExtended>;
}

interface IPropHandlers {
  onLogout: () => void;
  onRedirect: (path: string) => void;
}

interface IProps extends IPropValues, IPropHandlers { }

export class Component extends React.PureComponent<IProps, {}> {
  public render() {
    let title = "brdg.me";
    const myTurnGames = this.myTurnGames().size;
    if (myTurnGames > 0) {
      title += ` (${myTurnGames})`;
    }
    document.title = title;

    return (
      <div className="layout">
        <div className="menu">
          <h1>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              this.props.onRedirect("/");
            }}>brdg.me</a>
          </h1>
          <div className="subheading">
            <a href="#" onClick={(e) => {
              e.preventDefault();
              this.props.onRedirect("/");
            }}>Lo-fi board games</a>
          </div>
          {this.renderAuth()}
          <div>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              this.props.onRedirect("/game/new");
            }}>New game</a>
          </div>
          {this.renderMyTurnGames()}
        </div>
        <div className="content">{this.props.children}</div>
      </div>
    );
  }

  private renderGame(game: Records.GameExtended): JSX.Element {
    const myPlayerId = game.game_player && game.game_player.id;
    return <div className="layout-game">
      <a href="#" onClick={(e) => {
        e.preventDefault();
        this.props.onRedirect(`/game/${game.game.id}`);
      }}>
        <div className="layout-game-name">
          {game.game_type.name}
        </div>
        <div className="layout-game-opponents">
          with {game.game_players
            .filter((gp) => gp && gp.game_player.id !== myPlayerId || false)
            .map((gp) => <span> <Player
              name={gp!.user.name}
              color={gp!.game_player.color}
            /></span>)}
        </div>
      </a>
    </div>;
  }

  private renderMyTurnGames(): JSX.Element | undefined {
    const myTurnGames = this.myTurnGames();
    if (myTurnGames.size === 0) {
      return undefined;
    }
    return <div>
      <h2>Your turn</h2>
      {myTurnGames.map((g) => g && this.renderGame(g))}
    </div>;
  }

  private myTurnGames(): Immutable.List<Records.GameExtended> {
    if (this.props.activeGames === undefined || this.props.user === undefined) {
      return Immutable.List() as Immutable.List<Records.GameExtended>;
    }
    return this.props.activeGames
      .filter((ag) => ag!.game_player && ag!.game_player!.is_turn || false)
      .sortBy((ag) => ag!.game_player!.is_turn_at)
      .toList();
  }

  private renderAuth(): JSX.Element {
    if (this.props.user !== undefined) {
      return <div>
        <div>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            this.props.onLogout();
          }}>Logout</a>
        </div>
      </div>;
    } else {
      return <div>
        <a href="#" onClick={(e) => {
          e.preventDefault();
          this.props.onRedirect("/login");
        }}>Log in</a>
      </div>;
    }
  }
}

function mapStateToProps(state: AppState): IPropValues {
  return {
    user: state.session.user,
    activeGames: state.game.games.size > 0 && state.game.games.filter(
      (g: Records.GameExtended) => !g.game.is_finished,
    ).toList() || undefined,
  };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<{}>): IPropHandlers {
  return {
    onLogout: () => dispatch(Session.clearToken()),
    onRedirect: (path) => dispatch(Session.updatePath(path)),
  };
}

export const Container: React.ComponentClass<{}> = ReactRedux.connect(
  mapStateToProps,
  mapDispatchToProps,
)(Component);
