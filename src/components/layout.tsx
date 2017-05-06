import * as Immutable from "immutable";
import * as React from "react";
import * as ReactRedux from "react-redux";
import * as Redux from "redux";

import * as Records from "../records";
import { State as AppState } from "../reducers";
import * as Game from "../reducers/game";
import * as Session from "../reducers/session";
import { Spinner } from "./spinner";

export interface IPropValues {
  isLoggedIn: boolean;
  activeGames?: Immutable.List<Records.GameExtended>;
}

interface IPropHandlers {
  onLogout: () => void;
  onRedirect: (path: string) => void;
  onFetchActiveGames: () => void;
}

interface IProps extends IPropValues, IPropHandlers { }

export class Component extends React.PureComponent<IProps, {}> {
  public componentDidMount() {
    if (this.props.activeGames === undefined) {
      // In case sagas aren't running on app start.
      setTimeout(() => this.props.onFetchActiveGames());
    }
  }

  public render() {
    return (
      <div className="layout">
        <div className="menu">
          <h1>brdg.me</h1>
          <div className="subheading">
            Lo-fi board games
          </div>
          {this.renderAuth()}
          <div>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              this.props.onRedirect("/");
            }}>Home</a>
          </div>
          <div>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              this.props.onRedirect("/game/new");
            }}>New game</a>
          </div>
          {this.props.activeGames && <div>
            <ul>
              {this.props.activeGames.map((ag) =>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      this.props.onRedirect(`/game/${ag!.game.id}`);
                    }}
                  >
                    {ag!.game_type.name}
                  </a>
                </li>,
              )}
            </ul>
          </div> || <div>
              <Spinner />
            </div>
          }
        </div>
        <div className="content">{this.props.children}</div>
      </div>
    );
  }

  private renderAuth(): JSX.Element {
    if (this.props.isLoggedIn) {
      return <div>
        <div>Logged in</div>
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
    isLoggedIn: state.session.token !== undefined,
    activeGames: state.game.games.size > 0 && state.game.games.filter(
      (g: Records.GameExtended) => !g.game.is_finished,
    ).toList() as Immutable.List<Records.GameExtended> || undefined,
  };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<{}>): IPropHandlers {
  return {
    onLogout: () => dispatch(Session.clearToken()),
    onRedirect: (path) => dispatch(Session.updatePath(path)),
    onFetchActiveGames: () => dispatch(Game.fetchActiveGames()),
  };
}

export const Container = ReactRedux.connect(
  mapStateToProps,
  mapDispatchToProps,
)(Component);
