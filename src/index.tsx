import * as React from "react";
import * as ReactDOM from "react-dom";
import './style.less';

import * as Router from './Router';
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";

interface BrdgmeState {
  email?: string,
  token?: string,
  userId?: string,
  path: string,
}

const emailLSOffset = 'email';
const tokenLSOffset = 'token';
const userIdLSOffset = 'userId';

class Brdgme extends React.Component<undefined, BrdgmeState> {
  constructor() {
    super();

    let token = localStorage.getItem(tokenLSOffset);
    let path = window.location.pathname;
    if (token === null && path !== '/login') {
      // Can't use `redirect` here because we can't call `setState`
      path = '/login';
      history.pushState(null, '', path);
    }
    this.state = {
      email: localStorage.getItem(emailLSOffset),
      token,
      path,
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  redirect(path: string) {
    history.pushState(null, '', path);
    this.setState({ path });
  }

  componentDidMount() {
    this.setState({
      token: localStorage.getItem(tokenLSOffset),
    });
  }

  handleTokenChange(token?: string) {
    if (token === null) {
      localStorage.removeItem(tokenLSOffset);
      this.redirect('/login');
    } else {
      localStorage.setItem(tokenLSOffset, token);
    }
    this.setState({ token });
  }

  handleEmailChange(email?: string) {
    if (email === null) {
      localStorage.removeItem(emailLSOffset);
    } else {
      localStorage.setItem(emailLSOffset, email);
    }
    this.setState({ email });
  }

  handleUserIdChange(userId?: string) {
    if (userId === null) {
      localStorage.removeItem(userIdLSOffset);
    } else {
      localStorage.setItem(userIdLSOffset, userId);
    }
    this.setState({ userId });
  }

  handleLogin(email: string, token: string, userId: string) {
    this.handleTokenChange(token);
    this.handleEmailChange(email);
    this.handleUserIdChange(userId);
    this.redirect('/');
  }

  handleLogout() {
    this.handleTokenChange(null);
  }

  render() {
    return Router.first(this.state.path, [
      Router.match('/login', () => <Login
        initialEmail={this.state.email}
        onLogin={this.handleLogin}
      />),
      Router.any(() => <Layout
        email={this.state.email}
        token={this.state.token}
        userId={this.state.userId}
        path={this.state.path}
        onLogout={this.handleLogout}
      />
      )
    ]);
  }
}

ReactDOM.render(
  <Brdgme />,
  document.body,
);