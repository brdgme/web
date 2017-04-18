import * as React from "react";

import { Spinner } from './Spinner';
import { Session, GameExtended } from '../Model';

export interface LayoutProps {
  session: Session,
  activeGames?: GameExtended[],
  redirect: (path: string) => void,
}

export interface LayoutState {
}

export class Layout extends React.Component<LayoutProps, LayoutState> {
  constructor(props?: LayoutProps, context?: any) {
    super(props, context);

    this.state = {};
  }

  render() {
    return (
      <div className="layout">
        <div className="menu">
          <h1>brdg.me</h1>
          <div>Logged in</div>
          <div>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              this.props.session.logout();
            }}>Logout</a>
          </div>
          <div>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              this.props.redirect('/')
            }}>Home</a>
          </div>
          <div>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              this.props.redirect('/game/new')
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
                      this.props.redirect(`/game/${ag.game.id}`);
                    }}
                  >
                    {ag.game_type.name}
                  </a>
                </li>
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
}