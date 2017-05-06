import * as React from "react";
import * as superagent from "superagent";

import { IGameVersionType } from "../../model";
import { Container as Layout } from "../layout";

export interface IGameNewState {
  gameVersions?: IGameVersionType[];
  gameVersionId?: string;
  opponentIds: string[];
  opponentEmails: string[];
}

export class GameNew extends React.Component<{}, IGameNewState> {
  constructor(props?: {}, context?: any) {
    super(props, context);

    this.state = {
      opponentEmails: [],
      opponentIds: [],
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleGameVersionSelectChange = this.handleGameVersionSelectChange.bind(this);
    this.handleAddOpponentIdClick = this.handleAddOpponentIdClick.bind(this);
    this.handleAddOpponentEmailClick = this.handleAddOpponentEmailClick.bind(this);
  }

  public render() {
    return (
      <Layout>
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

  private componentDidMount() {
    this.fetchVersions();
  }

  private fetchVersions() {
    /*
    superagent
      .get(`${process.env.API_SERVER}/game/version_public`)
      .auth(this.props.layout.session.email, this.props.layout.session.token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .end((err, res) => {
        if (err || !res.ok) {
          if (res.unauthorized) {
            this.props.layout.session.logout();
          } else {
            throw new Error("error getting public versions");
          }
          return;
        }
        this.setState({
          gameVersionId: res.body.versions.length > 0 && res.body.versions[0].game_version.id,
          gameVersions: res.body.versions,
        });
      });
      */
  }

  private handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    /*
    superagent
      .post(`${process.env.API_SERVER}/game`)
      .auth(this.props.layout.session.email, this.props.layout.session.token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        game_version_id: this.state.gameVersionId,
        opponent_emails: this.state.opponentEmails,
        opponent_ids: this.state.opponentIds,
      })
      .end((err, res) => {
        if (err || !res.ok) {
          if (res.unauthorized) {
            this.props.layout.session.logout();
          } else {
            throw new Error("error creating game");
          }
          return;
        }
        this.props.layout.redirect(`/game/${res.body.id}`);
      });
      */
  }

  private handleGameVersionSelectChange(e: React.FormEvent<HTMLSelectElement>) {
    this.setState({
      gameVersionId: e.currentTarget.value,
    });
  }

  private handleAddOpponentIdClick(e: React.SyntheticEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const opponentIds = this.state.opponentIds;
    opponentIds.push("");
    this.setState({
      opponentIds,
    });
  }

  private handleRemoveOpponentId(e: React.SyntheticEvent<HTMLAnchorElement>, key: number) {
    e.preventDefault();
    const opponentIds = this.state.opponentIds;
    opponentIds.splice(key, 1);
    this.setState({
      opponentIds,
    });
  }

  private handleOpponentIdChange(e: React.SyntheticEvent<HTMLInputElement>, key: number) {
    const opponentIds = this.state.opponentIds;
    opponentIds[key] = e.currentTarget.value;
    this.setState({
      opponentIds,
    });
  }

  private handleAddOpponentEmailClick(e: React.SyntheticEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const opponentEmails = this.state.opponentEmails;
    opponentEmails.push("");
    this.setState({
      opponentEmails,
    });
  }

  private handleRemoveOpponentEmail(e: React.SyntheticEvent<HTMLAnchorElement>, key: number) {
    e.preventDefault();
    const opponentEmails = this.state.opponentEmails;
    opponentEmails.splice(key, 1);
    this.setState({
      opponentEmails,
    });
  }

  private handleOpponentEmailChange(e: React.SyntheticEvent<HTMLInputElement>, key: number) {
    const opponentEmails = this.state.opponentEmails;
    opponentEmails[key] = e.currentTarget.value;
    this.setState({
      opponentEmails,
    });
  }
}
