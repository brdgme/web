import * as classNames from "classnames";
import * as Draft from "draft-js";
import * as moment from "moment";
import * as React from "react";
import * as superagent from "superagent";

import { IGameExtended } from "../../model";
import { Container as Layout } from "../layout";
import { Spinner } from "../spinner";

const timeFormat = "h:mm A";
const dowFormat = "ddd";
const recentDateFormat = "MMM D";
const oldDateFormat = "YYYY-M-D";

export interface IGameShowProps {
  game?: IGameExtended;
  onCommand?: (command: string) => void;
  submittingCommand?: boolean;
  commandError?: string;
}

export interface IGameShowState {
  commandInputState: Draft.EditorState;
}

export class GameShow extends React.Component<IGameShowProps, IGameShowState> {
  constructor(props?: IGameShowProps, context?: any) {
    super(props, context);

    this.state = {
      commandInputState: Draft.EditorState.createEmpty(),
    };

    this.onCommandInputChange = this.onCommandInputChange.bind(this);
    this.onCommandInputKeyEvent = this.onCommandInputKeyEvent.bind(this);
    this.focusCommandInput = this.focusCommandInput.bind(this);
  }

  public render(): JSX.Element {
    return (
      <Layout>
        <div className="game-container">
          <div className="game-main">
            <div className="game-render">
              {this.props.game && this.props.game.html
                && <pre
                  dangerouslySetInnerHTML={{ __html: this.props.game.html }}
                />
                || <Spinner />
              }
            </div>
            <div className={classNames({
              "disabled": this.props.submittingCommand,
              "game-command-input": true,
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

  private componentDidMount() {
    this.focusCommandInput();
    document.addEventListener("keydown", this.focusCommandInput);
  }

  private componentWillUnmount() {
    document.removeEventListener("keydown", this.focusCommandInput);
  }

  private focusCommandInput() {
    (this.refs.editor as Draft.Editor).focus();
  }

  private formatLogTime(t: moment.Moment): string {
    let prefix = "";
    if (t.isBefore(moment().startOf("month").subtract(11, "months"))) {
      prefix = `${oldDateFormat}, `;
    } else if (t.isBefore(moment().startOf("day").subtract(6, "days"))) {
      prefix = `${recentDateFormat}, `;
    } else if (t.isBefore(moment().startOf("day"))) {
      prefix = `${dowFormat}, `;
    }
    return t.local().format(`${prefix}${timeFormat}`);
  }

  private renderLogs(): JSX.Element {
    if (this.props.game === undefined || this.props.game.game_logs === undefined) {
      return <div />;
    }
    let lastLog: moment.Moment;
    const renderedLogs: JSX.Element[] = this.props.game.game_logs.map((gl) => {
      let timeEl: JSX.Element = <div />;
      const logTime = moment.utc(gl.game_log.logged_at);
      if (lastLog === undefined || logTime.clone().subtract(10, "minutes").isAfter(lastLog)) {
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
      );
    });
    return <div>{renderedLogs}</div>;
  }

  private onCommandInputChange(commandInputState: Draft.EditorState) {
    this.setState({ commandInputState });
  }

  private onCommandInputKeyEvent(e: React.KeyboardEvent<{}>) {
    if (e.key === "Enter" && this.props.onCommand !== undefined) {
      this.props.onCommand(
        this.state.commandInputState.getCurrentContent().getPlainText());
      return "move-selection-to-end-of-block";
    }
    return Draft.getDefaultKeyBinding(e);
  }
}
