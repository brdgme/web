import * as React from "react";
import * as ReactDOM from "react-dom";
import * as superagent from 'superagent';

import './style.less';

import * as Router from './Router';
import { Login } from "./components/Login";
import { Home } from './components/Home';
import { GameNew } from './components/game/New';
import { GameIndex } from './components/game/Index';
import { GameShow } from './components/game/Show';
import { LayoutProps } from './components/Layout';
import { GameExtended } from './Model';

interface BrdgmeState {
  email?: string,
  token?: string,
  userId?: string,
  path: string,
  activeGames?: GameExtended[],
}

const emailLSOffset = 'email';
const tokenLSOffset = 'token';
const userIdLSOffset = 'userId';

function path(): string {
  return location.hash.substr(1) || '/';
}

class Brdgme extends React.Component<{}, BrdgmeState> {
  constructor() {
    super();

    let token = localStorage.getItem(tokenLSOffset);
    let p = path();
    if (token === null && p !== '/login') {
      // Can't use `redirect` here because we can't call `setState`
      p = '/login';
      location.hash = p;
    }
    this.state = {
      email: localStorage.getItem(emailLSOffset) || undefined,
      token: token || undefined,
      path: p,
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.redirect = this.redirect.bind(this);
    this.fetchActiveGames = this.fetchActiveGames.bind(this);
  }

  redirect(path: string) {
    location.hash = path;
  }

  fetchActiveGames() {
    if (this.state.email === undefined || this.state.token === undefined) {
      return;
    }
    superagent
      .get(`${process.env.API_SERVER}/game/my_active`)
      .auth(this.state.email, this.state.token)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) {
          if (res.unauthorized) {
            this.handleLogout();
          } else {
            console.log(err, res);
          }
          return;
        }
        this.setState({
          activeGames: res.body.games,
        });
      });
  }

  componentDidMount() {
    window.onhashchange = (event) => {
      this.setState({
        path: path(),
      });
    };
    this.fetchActiveGames();
  }

  handleTokenChange(token: string | null) {
    if (token === null) {
      localStorage.removeItem(tokenLSOffset);
      this.redirect('/login');
    } else {
      localStorage.setItem(tokenLSOffset, token);
    }
    this.setState({ token: token || undefined });
  }

  handleEmailChange(email: string | null) {
    if (email === null) {
      localStorage.removeItem(emailLSOffset);
    } else {
      localStorage.setItem(emailLSOffset, email);
    }
    this.setState({ email: email || undefined });
  }

  handleUserIdChange(userId: string | null) {
    if (userId === null) {
      localStorage.removeItem(userIdLSOffset);
    } else {
      localStorage.setItem(userIdLSOffset, userId);
    }
    this.setState({ userId: userId || undefined });
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

  layoutProps(): LayoutProps {
    return {
      activeGames: this.state.activeGames,
      session: {
        email: this.state.email!,
        token: this.state.token!,
        userId: this.state.userId!,
        logout: this.handleLogout,
      },
      redirect: this.redirect,
    };
  }

  render() {
    return Router.first(this.state.path, [
      Router.match('/login', () => <Login
        initialEmail={this.state.email}
        onLogin={this.handleLogin}
      />),
      Router.prefix('/game', (remaining) =>
        Router.first(remaining, [
          Router.match('/new', () => <GameNew
            layout={this.layoutProps()}
          />),
          Router.empty(() => <GameIndex
            layout={this.layoutProps()}
          />),
          Router.any(() => <GameShow
            id={remaining.substring(1)}
            layout={this.layoutProps()}
          />)
        ])
      ),
      Router.any(() => <Home
        layout={this.layoutProps()}
      />
      )
    ]);
  }
}

ReactDOM.render(
  <Brdgme />,
  document.body,
);