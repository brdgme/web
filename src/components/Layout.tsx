import * as React from "react";
import * as superagent from 'superagent';

import { Spinner } from './Spinner';
import { Session, GameExtended } from '../Model';

export interface LayoutProps {
  session: Session,
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
      .auth(this.props.session.email, this.props.session.token)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) {
          if (res.unauthorized) {
            this.props.session.logout();
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
            this.props.session.logout();
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
        <div>{this.props.children}</div>
      </div>
    );
  }
}