import * as React from "react";
import * as superagent from 'superagent';

import { Layout, LayoutProps } from '../layout';
import { GameVersionType } from '../../model';

export interface GameNewProps {
  layout: LayoutProps,
}

export interface GameNewState {
  gameVersions?: GameVersionType[],
  gameVersionId?: string,
  opponentIds: string[],
  opponentEmails: string[],
}

export class GameNew extends React.Component<GameNewProps, GameNewState> {
  constructor(props?: GameNewProps, context?: any) {
    super(props, context);

    this.state = {
      opponentIds: [],
      opponentEmails: [],
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleGameVersionSelectChange = this.handleGameVersionSelectChange.bind(this);
    this.handleAddOpponentIdClick = this.handleAddOpponentIdClick.bind(this);
    this.handleAddOpponentEmailClick = this.handleAddOpponentEmailClick.bind(this);
  }

  componentDidMount() {
    this.fetchVersions();
  }

  fetchVersions() {
    superagent
      .get(`${process.env.API_SERVER}/game/version_public`)
      .auth(this.props.layout.session.email, this.props.layout.session.token)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) {
          if (res.unauthorized) {
            this.props.layout.session.logout();
          } else {
            console.log(err, res);
          }
          return;
        }
        this.setState({
          gameVersions: res.body.versions,
          gameVersionId: res.body.versions.length > 0 && res.body.versions[0].game_version.id,
        });
      });
  }

  handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    superagent
      .post(`${process.env.API_SERVER}/game`)
      .auth(this.props.layout.session.email, this.props.layout.session.token)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        game_version_id: this.state.gameVersionId,
        opponent_ids: this.state.opponentIds,
        opponent_emails: this.state.opponentEmails,
      })
      .end((err, res) => {
        if (err || !res.ok) {
          if (res.unauthorized) {
            this.props.layout.session.logout();
          } else {
            console.log(err, res);
          }
          return;
        }
        this.props.layout.redirect(`/game/${res.body.id}`);
      });
  }

  handleGameVersionSelectChange(e: React.FormEvent<HTMLSelectElement>) {
    this.setState({
      gameVersionId: e.currentTarget.value,
    });
  }

  handleAddOpponentIdClick(e: React.SyntheticEvent<HTMLAnchorElement>) {
    e.preventDefault();
    let opponentIds = this.state.opponentIds;
    opponentIds.push('');
    this.setState({
      opponentIds,
    });
  }

  handleRemoveOpponentId(e: React.SyntheticEvent<HTMLAnchorElement>, key: number) {
    e.preventDefault();
    let opponentIds = this.state.opponentIds;
    opponentIds.splice(key, 1);
    this.setState({
      opponentIds,
    });
  }

  handleOpponentIdChange(e: React.SyntheticEvent<HTMLInputElement>, key: number) {
    let opponentIds = this.state.opponentIds;
    opponentIds[key] = e.currentTarget.value;
    this.setState({
      opponentIds,
    });
  }

  handleAddOpponentEmailClick(e: React.SyntheticEvent<HTMLAnchorElement>) {
    e.preventDefault();
    let opponentEmails = this.state.opponentEmails;
    opponentEmails.push('');
    this.setState({
      opponentEmails,
    });
  }

  handleRemoveOpponentEmail(e: React.SyntheticEvent<HTMLAnchorElement>, key: number) {
    e.preventDefault();
    let opponentEmails = this.state.opponentEmails;
    opponentEmails.splice(key, 1);
    this.setState({
      opponentEmails,
    });
  }

  handleOpponentEmailChange(e: React.SyntheticEvent<HTMLInputElement>, key: number) {
    let opponentEmails = this.state.opponentEmails;
    opponentEmails[key] = e.currentTarget.value;
    this.setState({
      opponentEmails,
    });
  }

  render() {
    return (
      <Layout
        {...this.props.layout}
      >
        <h1>New game</h1>
        {this.state.gameVersions && <form onSubmit={this.handleSubmit}>
          <h2>Game</h2>
          <div>
            <select
              value={this.state.gameVersionId}
              onChange={this.handleGameVersionSelectChange}
            >
              {this.state.gameVersions.map((gv) => <option
                value={gv.game_version.id}
              >
                {gv.game_type.name}
              </option>)}
            </select>
          </div>
          <h2>Opponent IDs</h2>
          {this.state.opponentIds.map((oId, key) => <div>
            <input
              value={oId}
              onChange={(e) => this.handleOpponentIdChange(e, key)}
            />
            <a href="#" onClick={(e) => this.handleRemoveOpponentId(e, key)}>X</a>
          </div>)}
          <div>
            <a href="#" onClick={this.handleAddOpponentIdClick}>Add</a>
          </div>
          <h2>Opponent emails</h2>
          {this.state.opponentEmails.map((oEmail, key) => <div>
            <input
              value={oEmail}
              onChange={(e) => this.handleOpponentEmailChange(e, key)}
            />
            <a href="#" onClick={(e) => this.handleRemoveOpponentEmail(e, key)}>X</a>
          </div>)}
          <div>
            <a href="#" onClick={this.handleAddOpponentEmailClick}>Add</a>
          </div>
          <div>
            <input type="submit" value="Create game" />
          </div>
        </form>}
      </Layout>
    );
  }
}

