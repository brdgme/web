import * as React from "react";
import * as superagent from 'superagent';

import { Layout, LayoutProps } from '../Layout';
import { GameVersionType } from '../../Model';

export interface GameNewProps {
  layout: LayoutProps,
}

export interface GameNewState {
  gameVersions?: GameVersionType[],
  gameVersionId?: string,
}

export class GameNew extends React.Component<GameNewProps, GameNewState> {
  constructor(props?: GameNewProps, context?: any) {
    super(props, context);

    this.state = {};

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleGameVersionSelectChange = this.handleGameVersionSelectChange.bind(this);
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
    console.log(this.state);
  }

  handleGameVersionSelectChange(e: React.FormEvent<HTMLSelectElement>) {
    this.setState({
      gameVersionId: e.currentTarget.value,
    });
  }

  render() {
    return (
      <Layout
        {...this.props.layout}
      >
        <h1>New game</h1>
        {this.state.gameVersions && <form onSubmit={this.handleSubmit}>
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
          <input type="submit" value="Create game" />
        </form>}
      </Layout>
    );
  }
}

