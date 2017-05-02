import * as React from 'react';
import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';
import * as superagent from 'superagent';
import * as Thunk from 'redux-thunk';

import { Spinner } from './spinner';
import { State as AppState } from '../reducers';
import * as Reducer from '../reducers/login';

interface PropValues {
  email: string,
  code: string,
  mode: Reducer.Mode,
}

interface PropHandlers {
  onSubmitEmail: (email: string) => void,
  onSubmitCode: (email: string, code: string) => void,
  onChangeMode: (mode: Reducer.Mode) => void,
  onChangeEmail: (email: string) => void,
  onChangeCode: (code: string) => void,
}

interface Props extends PropValues, PropHandlers { }

export class Component extends React.PureComponent<Props, {}> {
  constructor(props?: Props, context?: any) {
    super(props, context);
    this.handleSubmitEmail = this.handleSubmitEmail.bind(this);
    this.handleSubmitCode = this.handleSubmitCode.bind(this);
    this.handleClickHasCode = this.handleClickHasCode.bind(this);
    this.handleClickChangeEmail = this.handleClickChangeEmail.bind(this);
    this.handleChangeEmail = this.handleChangeEmail.bind(this);
    this.handleChangeCode = this.handleChangeCode.bind(this);
  }

  handleChangeEmail(e: React.ChangeEvent<HTMLInputElement>) {
    this.props.onChangeEmail(e.target.value);
  }

  handleChangeCode(e: React.ChangeEvent<HTMLInputElement>) {
    this.props.onChangeCode(e.target.value);
  }

  handleSubmitEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    this.props.onSubmitEmail(this.props.email);
  }

  handleSubmitCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    this.props.onSubmitCode(this.props.email, this.props.code);
  }

  handleClickHasCode(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    let form = (e.currentTarget.parentElement!.parentElement) as HTMLFormElement;
    if (form.reportValidity()) {
      this.props.onChangeMode(Reducer.Mode.EnteringCode);
    }
  }

  handleClickChangeEmail(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    this.props.onChangeMode(Reducer.Mode.EnteringEmail);
  }

  render() {
    return (
      <div className="login">
        <h1>brdg.me</h1>
        <div className="subtitle">
          Lo-fi board games, email / web
        </div>
        {this.props.mode === Reducer.Mode.EnteringEmail && (
          <div>
            <div>Enter your email address to start</div>
            <form onSubmit={this.handleSubmitEmail}>
              <div>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="Email address"
                  value={this.props.email}
                  onChange={this.handleChangeEmail}
                />
                <input type="submit" value="Get code" />
              </div>
              <div className="hasCode">
                <a href="#" onClick={this.handleClickHasCode}>I already have a login code</a>
              </div>
            </form>
          </div>
        ) || (
            <div>
              Logging in as
              <a href="#" onClick={this.handleClickChangeEmail}>{this.props.email}</a>
            </div>
          )}
        {this.props.mode === Reducer.Mode.EnteringCode && (
          <div>
            <div>A login code has been sent to your email, please enter it here</div>
            <form onSubmit={this.handleSubmitCode}>
              <input
                type="tel"
                pattern="[0-9]*"
                required
                autoFocus
                placeholder="Login code"
                value={this.props.code}
                onChange={this.handleChangeCode}
              />
              <input type="submit" value="Play!" />
            </form>
          </div>
        )}
        {(this.props.mode === Reducer.Mode.SubmittingEmail ||
          this.props.mode === Reducer.Mode.SubmittingCode) && (
            <Spinner />
          )}
      </div>
    );
  }
}

function mapStateToProps(state: AppState): PropValues {
  return {
    email: state.login.email,
    code: state.login.code,
    mode: state.login.mode,
  };
}

function mapDispatchToProps(dispatch: Redux.Dispatch<AppState>): PropHandlers {
  return {
    onSubmitEmail: (email: string) => {
      dispatch(Reducer.submitEmail(email));
    },
    onSubmitCode: (email: string, code: string) => {
      dispatch(Reducer.submitCode(email, code));
    },
    onChangeMode: (mode: Reducer.Mode) => {
      dispatch(Reducer.updateMode(mode));
    },
    onChangeEmail: (email: string) => {
      dispatch(Reducer.updateEmail(email));
    },
    onChangeCode: (code: string) => {
      dispatch(Reducer.updateCode(code));
    },
  };
}

export const Container = ReactRedux.connect(
  mapStateToProps,
  mapDispatchToProps,
)(Component);