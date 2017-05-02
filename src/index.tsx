import * as React from "react";
import * as ReactDOM from "react-dom";
import * as superagent from 'superagent';
import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';
import ReduxThunk from 'redux-thunk';

import './style.less';

import * as Router from './router';
import { Container as Login } from "./components/login";
import { Home } from './components/home';
import { GameNew } from './components/game/new';
import { GameIndex } from './components/game/index';
import { GameShow } from './components/game/show';
import { LayoutProps } from './components/layout';
import { GameExtended } from './model';
import { App, State } from './reducers';

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
  wsUser?: WebSocket;

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
      userId: localStorage.getItem(userIdLSOffset) || undefined,
      token: token || undefined,
      path: p,
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.redirect = this.redirect.bind(this);
    this.fetchActiveGames = this.fetchActiveGames.bind(this);
    this.wsUserConnect = this.wsUserConnect.bind(this);
    this.wsUserDisconnect = this.wsUserDisconnect.bind(this);
  }

  wsUserConnect(id: string) {
    this.wsUser = new WebSocket(`${process.env.WS_SERVER}/user.${id}`);
    this.wsUser.addEventListener('message', (event) => {
      let data = JSON.parse(event.data);
      // Data is an individual game, we either need to update the matching game
      // in activeGames, or append it.
      let activeGames = this.state.activeGames || [];
      let index: number | undefined = undefined;
      for (let i = 0, len = activeGames.length; i < len; i++) {
        if (data.game.id === activeGames[i].game.id) {
          index = i;
          break;
        }
      }
      if (index !== undefined) {
        activeGames[index] = data;
      } else {
        activeGames.push(data);
      }
      this.setState({
        activeGames: activeGames,
      });
    });
  }

  wsUserDisconnect() {
    if (this.wsUser === undefined) {
      return;
    }
    this.wsUser.close();
    this.wsUser = undefined;
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
        if (this.state.userId !== undefined) {
          this.wsUserConnect(this.state.userId);
        }
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
    this.wsUserDisconnect();
    if (userId === null) {
      localStorage.removeItem(userIdLSOffset);
    } else {
      localStorage.setItem(userIdLSOffset, userId);
      this.wsUserConnect(userId);
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
      //initialEmail={this.state.email}
      //onLogin={this.handleLogin}
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
  <ReactRedux.Provider store={Redux.createStore(
    App,
    new State(),
    Redux.applyMiddleware(ReduxThunk)
  )}>
    <Brdgme />
  </ReactRedux.Provider >,
  document.body,
);