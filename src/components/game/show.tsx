import * as classNames from "classnames";
import * as moment from "moment";
import * as React from "react";
import * as ReactRedux from "react-redux";
import * as Redux from "redux";
import * as superagent from "superagent";

import * as Records from "../../records";
import { State as AppState } from "../../reducers";
import * as Game from "../../reducers/game";
import { Container as Layout } from "../layout";
import { Spinner } from "../spinner";

const timeFormat = "h:mm A";
const dowFormat = "ddd";
const recentDateFormat = "MMM D";
const oldDateFormat = "YYYY-M-D";

export interface IPropValues extends IOwnProps {
  game?: Records.GameExtended;
  commandInput: string;
  submittingCommand?: boolean;
  commandError?: string;
}

interface IPropHandlers {
  onCommandChange: (command: string) => void;
  onCommand: (gameId: string, command: string) => void;
  onFetch: (gameId: string) => void;
}

interface IProps extends IPropValues, IPropHandlers { }

export class Component extends React.PureComponent<IProps, {}> {
  constructor(props?: IProps, context?: any) {
    super(props, context);

    this.onCommandInputChange = this.onCommandInputChange.bind(this);
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
              <input
                value={this.props.commandInput}
                onChange={this.onCommandInputChange}
                placeholder="Enter command..."
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
    this.fetchGameIfRequired(this.props);
    this.focusCommandInput();
    document.addEventListener("keydown", this.focusCommandInput);
  }

  private componentWillReceiveProps(nextProps: IProps) {
    this.fetchGameIfRequired(nextProps);
  }

  private fetchGameIfRequired(props: IProps) {
    if (props.game === undefined || props.game.html === undefined) {
      props.onFetch(props.gameId);
    }
  }

  private componentWillUnmount() {
    document.removeEventListener("keydown", this.focusCommandInput);
  }

  private focusCommandInput() {
    (this.refs.editor as HTMLInputElement).focus();
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
      const logTime = moment.utc(gl!.game_log.logged_at);
      if (lastLog === undefined || logTime.clone().subtract(10, "minutes").isAfter(lastLog)) {
        timeEl = (
          <div className="log-time">- {this.formatLogTime(logTime)} -</div>
        );
      }
      lastLog = logTime;
      return (
        <div>
          {timeEl}
          <div dangerouslySetInnerHTML={{ __html: gl!.html }} />
        </div>
      );
    }).toArray();
    return <div>{renderedLogs}</div>;
  }

  private onCommandInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.props.onCommandChange(e.target.value);
  }
}

interface IOwnProps {
  gameId: string;
}

function mapStateToProps(state: AppState, ownProps: IOwnProps): IPropValues {
  return {
    gameId: ownProps.gameId,
    game: state.game.games.get(ownProps.gameId),
    commandInput: "",
    submittingCommand: false,
    commandError: undefined,
  };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<{}>, ownProps: IOwnProps): IPropHandlers {
  return {
    onCommand: (gameId, command) => { console.log(command); },
    onCommandChange: (command) => { console.log(command); },
    onFetch: (gameId) => dispatch(Game.fetchGame(gameId)),
  };
}

export const Container = ReactRedux.connect(
  mapStateToProps,
  mapDispatchToProps,
)(Component);
