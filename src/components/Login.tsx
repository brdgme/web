import * as React from "react";

import { Spinner } from './Spinner';

export interface LoginProps {
  initialEmail?: string,
  onLogin: (email: string, token: string) => void,
}
export interface LoginState {
  email: string,
  code: string,
  mode: Mode,
}

enum Mode {
  EnteringEmail,
  SubmittingEmail,
  EnteringCode,
  SubmittingCode,
}

export class Login extends React.Component<LoginProps, LoginState> {
  constructor(props?: LoginProps, context?: any) {
    super(props, context);
    this.onEmailSubmit = this.onEmailSubmit.bind(this);
    this.onCodeSubmit = this.onCodeSubmit.bind(this);
    this.onClickHasCode = this.onClickHasCode.bind(this);
    this.onClickChangeEmail = this.onClickChangeEmail.bind(this);

    this.state = {
      email: props && props.initialEmail || '',
      code: '',
      mode: Mode.EnteringEmail,
    };
  }

  onEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    this.setState({
      mode: Mode.SubmittingEmail,
    });
    setTimeout(() => this.setState({
      mode: Mode.EnteringCode,
    }), 1000);
  }

  onCodeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    this.setState({
      mode: Mode.SubmittingCode,
    });
    setTimeout(() => this.props.onLogin(
      this.state.email,
      'abcd1234',
    ), 1000);
  }

  onClickHasCode(e: React.FormEvent<HTMLAnchorElement>) {
    e.preventDefault();
    let form = (e.currentTarget.parentElement.parentElement) as HTMLFormElement;
    if (form.reportValidity()) {
      this.setState({
        mode: Mode.EnteringCode,
      });
    }
  }

  onClickChangeEmail(e: React.FormEvent<HTMLAnchorElement>) {
    e.preventDefault();
    this.setState({
      mode: Mode.EnteringEmail,
    });
  }

  render() {
    return (
      <div className="login">
        <h1>brdg.me</h1>
        <div className="subtitle">
          Discreet ASCII board games, email / web
        </div>
        {this.state.mode === Mode.EnteringEmail && (
          <div>
            <div>Enter your email address to start</div>
            <form onSubmit={this.onEmailSubmit}>
              <div>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="Email address"
                  value={this.state.email}
                  onChange={e => this.setState({
                    email: e.target.value,
                  })}
                />
                <input type="submit" value="Get code" />
              </div>
              <div className="hasCode">
                <a href="#" onClick={this.onClickHasCode}>I already have a login code</a>
              </div>
            </form>
          </div>
        ) || (
            <div>
              Logging in as
              <a href="#" onClick={this.onClickChangeEmail}>{this.state.email}</a>
            </div>
          )}
        {this.state.mode === Mode.EnteringCode && (
          <div>
            <div>A login code has been sent to your email, please enter it here</div>
            <form onSubmit={this.onCodeSubmit}>
              <input
                type="text"
                pattern="[0-9]*"
                required
                autoFocus
                placeholder="Login code"
                value={this.state.code}
                onChange={e => this.setState({
                  code: e.target.value,
                })}
              />
              <input type="submit" value="Play!" />
            </form>
          </div>
        )}
        {(this.state.mode === Mode.SubmittingEmail ||
          this.state.mode === Mode.SubmittingCode) && (
            <Spinner />
          )}
      </div>
    );
  }
}