import * as React from "react";
import * as superagent from 'superagent';

import { Layout, LayoutProps } from '../Layout';
import { Spinner } from '../Spinner';
import { GameShowAPI } from '../../Model';
import * as moment from 'moment';

const timeFormat = 'h:mm A';
const dowFormat = 'ddd';
const recentDateFormat = 'MMM D';
const oldDateFormat = 'YYYY-M-D';

export interface GameShowProps {
  id: string,
  layout: LayoutProps,
}

export interface GameShowState {
  game?: GameShowAPI,
}

export class GameShow extends React.Component<GameShowProps, GameShowState> {
  constructor(props?: GameShowProps, context?: any) {
    super(props, context);

    this.state = {};
  }

  componentDidMount() {
    this.fetch();
  }

  componentWillReceiveProps(nextProps: GameShowProps) {
    if (this.props.id !== nextProps.id) {
      this.setState({
        game: undefined,
      });
      this.fetch();
    }
  }

  fetch() {
    superagent
      .get(`${process.env.API_SERVER}/game/${this.props.id}`)
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
          game: res.body,
        });
      });
  }

  formatLogTime(t: moment.Moment): string {
    let prefix = '';
    if (t.isBefore(moment().startOf('month').subtract(11, 'months'))) {
      prefix = `${oldDateFormat}, `;
    } else if (t.isBefore(moment().startOf('day').subtract(6, 'days'))) {
      prefix = `${recentDateFormat}, `;
    } else if (t.isBefore(moment().startOf('day'))) {
      prefix = `${dowFormat}, `;
    }
    return t.local().format(`${prefix}${timeFormat}`);
  }

  renderLogs(): JSX.Element {
    if (this.state.game === undefined) {
      return null;
    }
    let lastLog: moment.Moment;
    let renderedLogs: JSX.Element[] = this.state.game.game_logs.map((gl) => {
      let timeEl: JSX.Element;
      let logTime = moment.utc(gl.game_log.logged_at);
      if (lastLog === undefined || logTime.subtract(5, 'minutes').isAfter(lastLog)) {
        timeEl = (
          <div className="log-time">- {this.formatLogTime(logTime)} -</div>
        );
      }
      lastLog = logTime;
      return (
        <div>
          {timeEl}
          <div dangerouslySetInnerHTML={{ __html: gl.html }} />
        </div>
      )
    });
    return <div>{renderedLogs}</div>;
  }

  render(): JSX.Element {
    return (
      <Layout
        {...this.props.layout}
      >
        <div className="game-container">
          <div className="game-render">
            {this.state.game
              && <pre
                dangerouslySetInnerHTML={{ __html: this.state.game.game_html }}
              />
              || <Spinner />
            }
          </div>
          <div className="game-logs">
            {this.renderLogs()}
          </div>
        </div>
      </Layout>
    );
  }
}
