import * as React from "react";
import * as superagent from 'superagent';
import * as moment from 'moment';
import * as Draft from 'draft-js';
import * as classNames from 'classnames';

import { Layout, LayoutProps } from '../layout';
import { Spinner } from '../spinner';
import { GameExtended } from '../../model';

const timeFormat = 'h:mm A';
const dowFormat = 'ddd';
const recentDateFormat = 'MMM D';
const oldDateFormat = 'YYYY-M-D';

export interface GameShowProps {
  game?: GameExtended,
  layout: LayoutProps,
  onCommand: (command: string) => void,
  submittingCommand: boolean,
  commandError?: string,
}

export interface GameShowState {
  commandInputState: Draft.EditorState,
}

export class GameShow extends React.Component<GameShowProps, GameShowState> {
  constructor(props?: GameShowProps, context?: any) {
    super(props, context);

    this.state = {
      commandInputState: Draft.EditorState.createEmpty(),
    };

    this.onCommandInputChange = this.onCommandInputChange.bind(this);
    this.onCommandInputKeyEvent = this.onCommandInputKeyEvent.bind(this);
    this.focusCommandInput = this.focusCommandInput.bind(this);
  }

  componentDidMount() {
    this.focusCommandInput();
    document.addEventListener('keydown', this.focusCommandInput);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.focusCommandInput);
  }

  focusCommandInput() {
    (this.refs.editor as Draft.Editor).focus();
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
    if (this.props.game === undefined || this.props.game.game_logs === undefined) {
      return <div />;
    }
    let lastLog: moment.Moment;
    let renderedLogs: JSX.Element[] = this.props.game.game_logs.map((gl) => {
      let timeEl: JSX.Element = <div />;
      let logTime = moment.utc(gl.game_log.logged_at);
      if (lastLog === undefined || logTime.clone().subtract(10, 'minutes').isAfter(lastLog)) {
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

  onCommandInputKeyEvent(e: React.KeyboardEvent<{}>) {
    if (e.key === 'Enter') {
      this.props.onCommand(
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
              {this.props.game && this.props.game.game_html
                && <pre
                  dangerouslySetInnerHTML={{ __html: this.props.game.game_html }}
                />
                || <Spinner />
              }
            </div>
            <div className={classNames({
              'game-command-input': true,
              'disabled': this.props.submittingCommand,
            })}>
              {this.props.commandError && <div className="command-error">
                {this.props.commandError}
              </div>}
              <Draft.Editor
                editorState={this.state.commandInputState}
                onChange={this.onCommandInputChange}
                placeholder="Enter command..."
                keyBindingFn={this.onCommandInputKeyEvent}
                readOnly={this.props.submittingCommand}
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
