import * as React from 'react';
import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';

import { Spinner } from './spinner';
import { State as AppState } from '../reducers';
import * as LoginReducer from '../reducers/login';

export interface PropValues {
  email: string,
  code: string,
  mode: LoginReducer.Mode,
}
export interface PropHandlers {
  onChangeEmail: (email: string) => void,
  onChangeCode: (code: string) => void,
  onChangeMode: (mode: LoginReducer.Mode) => void,
  onSubmitEmail: (email: string) => void,
  onSubmitCode: (email: string, code: string) => void,
}
export interface Props extends PropValues, PropHandlers { }

export class Component extends React.PureComponent<Props, {}> {
  constructor(props?: Props, context?: any) {
    super(props, context);

    this.handleChangeCode = this.handleChangeCode.bind(this);
    this.handleChangeEmail = this.handleChangeEmail.bind(this);
    this.handleClickChangeEmail = this.handleClickChangeEmail.bind(this);
    this.handleClickHaveCode = this.handleClickHaveCode.bind(this);
    this.handleSubmitCode = this.handleSubmitCode.bind(this);
    this.handleSubmitEmail = this.handleSubmitEmail.bind(this);
  }

  handleSubmitEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    this.props.onSubmitEmail(this.props.email);
  }

  handleSubmitCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    this.props.onSubmitCode(this.props.email, this.props.code);
  }

  handleClickHaveCode(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    let form = (e.currentTarget.parentElement!.parentElement) as HTMLFormElement;
    if (form.reportValidity()) {
      this.props.onChangeMode(LoginReducer.Mode.EnteringCode);
    }
  }

  handleClickChangeEmail(e: React.FormEvent<HTMLAnchorElement>) {
    e.preventDefault();
    this.props.onChangeMode(LoginReducer.Mode.EnteringEmail);
  }

  handleChangeCode(e: React.ChangeEvent<HTMLInputElement>) {
    this.props.onChangeCode(e.target.value);
  }

  handleChangeEmail(e: React.ChangeEvent<HTMLInputElement>) {
    this.props.onChangeEmail(e.target.value);
  }

  render() {
    return (
      <div className="login">
        <h1>brdg.me</h1>
        <div className="subtitle">
          Lo-fi board games, email / web
        </div>
        {this.props.mode === LoginReducer.Mode.EnteringEmail && (
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
                <a href="#" onClick={this.handleClickHaveCode}>I already have a login code</a>
              </div>
            </form>
          </div>
        ) || (
            <div>
              Logging in as
              <a href="#" onClick={this.handleClickChangeEmail}>{this.props.email}</a>
            </div>
          )}
        {this.props.mode === LoginReducer.Mode.EnteringCode && (
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
        {(this.props.mode === LoginReducer.Mode.SubmittingEmail ||
          this.props.mode === LoginReducer.Mode.SubmittingCode) && (
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

function mapDispatchToProps(dispatch: Redux.Dispatch<{}>): PropHandlers {
  return {
    onChangeCode: (code) => dispatch(LoginReducer.updateCode(code)),
    onChangeEmail: (email) => dispatch(LoginReducer.updateEmail(email)),
    onChangeMode: (mode) => dispatch(LoginReducer.updateMode(mode)),
    onSubmitEmail: (email) => dispatch(LoginReducer.submitEmail(email)),
    onSubmitCode: (email, code) => dispatch(LoginReducer.submitCode(email, code)),
  };
}

export const Container = ReactRedux.connect(
  mapStateToProps,
  mapDispatchToProps,
)(Component);