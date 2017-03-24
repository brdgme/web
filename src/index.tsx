import * as React from "react";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
} from 'react-router-dom';
import * as ReactDOM from "react-dom";
import './style.less';

import { Login } from "./components/Login";

interface BrdgmeState {
  email?: string,
  token?: string,
}

const emailLSOffset = 'email';
const tokenLSOffset = 'token';

class Brdgme extends React.Component<undefined, BrdgmeState> {
  constructor() {
    super();

    this.state = {
      email: localStorage.getItem(emailLSOffset),
      token: localStorage.getItem(tokenLSOffset),
    };

    this.handleLogin = this.handleLogin.bind(this);
  }

  componentDidMount() {
    this.setState({
      token: localStorage.getItem(tokenLSOffset),
    });
  }

  handleTokenChange(token?: string) {
    localStorage.setItem(tokenLSOffset, token);
    this.setState({ token });
  }

  handleEmailChange(email?: string) {
    localStorage.setItem(emailLSOffset, email);
    this.setState({ email });
  }

  handleLogin(email: string, token: string) {
    this.handleTokenChange(token);
    this.handleEmailChange(email);
  }

  render() {
    return (
      <Router>
        <div>
          <Route exact path="/" render={() => (
            this.state.token
            &&
            <div>
              <div>Logged in</div>
              <div>
                <a href="#" onClick={() => this.handleTokenChange(null)}>Logout</a>
              </div>
            </div>
            ||
            <Redirect to={{
              pathname: '/login',
            }} />
          )} />
          <Route path="/login" render={() => (
            this.state.token
            &&
            <Redirect to={{
              pathname: '/',
            }} />
            ||
            <Login
              initialEmail={this.state.email}
              onLogin={this.handleLogin}
            />
          )} />
        </div>
      </Router>
    )
  }
}

ReactDOM.render(
  <Brdgme />,
  document.getElementById("brdgme")
);