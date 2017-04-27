import * as React from "react";
import * as superagent from 'superagent';
import * as moment from 'moment';
import * as Draft from 'draft-js';
import * as classNames from 'classnames';

import { Layout, LayoutProps } from '../Layout';
import { Spinner } from '../Spinner';
import { GameShowAPI } from '../../Model';

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
  commandInputState: Draft.EditorState,
  submittingCommand: boolean,
  commandError?: string,
}

export class GameShow extends React.Component<GameShowProps, GameShowState> {
  constructor(props?: GameShowProps, context?: any) {
    super(props, context);

    this.state = {
      commandInputState: Draft.EditorState.createEmpty(),
      submittingCommand: false,
    };

    this.onCommandInputChange = this.onCommandInputChange.bind(this);
    this.onCommandInputKeyEvent = this.onCommandInputKeyEvent.bind(this);
    this.focusCommandInput = this.focusCommandInput.bind(this);
  }

  componentDidMount() {
    this.fetch();
    this.focusCommandInput();
    document.addEventListener('keydown', this.focusCommandInput);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.focusCommandInput);
  }

  focusCommandInput() {
    (this.refs.editor as Draft.Editor).focus();
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
      return <div />;
    }
    let lastLog: moment.Moment;
    let renderedLogs: JSX.Element[] = this.state.game.game_logs.map((gl) => {
      let timeEl: JSX.Element = <div />;
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

  onCommandInputChange(commandInputState: Draft.EditorState) {
    this.setState({ commandInputState });
  }

  submitCommand(cmd: string) {
    this.setState({
      submittingCommand: true,
    });
    superagent
      .post(`${process.env.API_SERVER}/game/${this.props.id}/command`)
      .auth(this.props.layout.session.email, this.props.layout.session.token)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        command: cmd,
      })
      .end((err, res) => {
        if (res.unauthorized) {
          this.props.layout.session.logout();
          return;
        } else if (res.badRequest) {
          this.setState({
            submittingCommand: false,
            commandError: res.text,
          });
          console.log(this.state);
          return;
        } else if (err || !res.ok) {
          this.setState({
            submittingCommand: false,
            commandError: 'Error sending command to brdg.me server, please try again',
          });
          return;
        }
        this.setState({
          game: res.body,
          submittingCommand: false,
          commandError: undefined,
          commandInputState: Draft.EditorState.push(
            this.state.commandInputState,
            Draft.ContentState.createFromText(''),
            'delete-character',
          ),
        });
      });
  }

  onCommandInputKeyEvent(e: React.KeyboardEvent<{}>) {
    if (e.key === 'Enter') {
      this.submitCommand(
        this.state.commandInputState.getCurrentContent().getPlainText());
      return 'move-selection-to-end-of-block';
    }
    return Draft.getDefaultKeyBinding(e);
  }

  render(): JSX.Element {
    return (
      <Layout
        {...this.props.layout }
      >
        <div className="game-container">
          <div className="game-main">
            <div className="game-render">
              {this.state.game
                && <pre
                  dangerouslySetInnerHTML={{ __html: this.state.game.game_html }}
                />
                || <Spinner />
              }
            </div>
            <div className={classNames({
              'game-command-input': true,
              'disabled': this.state.submittingCommand,
            })}>
              {this.state.commandError && <div className="command-error">
                {this.state.commandError}
              </div>}
              <Draft.Editor
                editorState={this.state.commandInputState}
                onChange={this.onCommandInputChange}
                placeholder="Enter command..."
                keyBindingFn={this.onCommandInputKeyEvent}
                readOnly={this.state.submittingCommand}
                ref="editor"
              />
            </div>
          </div>
          <div className="game-logs">
            {this.renderLogs()}
          </div>
        </div>
      </Layout >
    );
  }
}
