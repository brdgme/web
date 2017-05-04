import * as React from "react";
import * as ReactDOM from "react-dom";
import * as superagent from 'superagent';
import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import mySaga from './saga';

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
  submittingCommand: boolean,
  commandError?: string,
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
      submittingCommand: false,
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.redirect = this.redirect.bind(this);
    this.fetchActiveGames = this.fetchActiveGames.bind(this);
    this.wsUserConnect = this.wsUserConnect.bind(this);
    this.wsUserDisconnect = this.wsUserDisconnect.bind(this);
    this.submitCommand = this.submitCommand.bind(this);
  }

  wsUserConnect(id: string) {
    this.wsUser = new WebSocket(`${process.env.WS_SERVER}/user.${id}`);
    this.wsUser.addEventListener('message', (event) => {
      this.updateGameState(JSON.parse(event.data) as GameExtended);
    });
  }

  wsUserDisconnect() {
    if (this.wsUser === undefined) {
      return;
    }
    this.wsUser.close();
    this.wsUser = undefined;
  }

  updateGameState(data: GameExtended) {
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
      activeGames,
    });
  }

  fetchGame(id: string) {
    superagent
      .get(`${process.env.API_SERVER}/game/${id}`)
      .auth(this.state.email!, this.state.token!)
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
        this.updateGameState(res.body as GameExtended);
      });
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

  findGame(id: string): GameExtended | undefined {
    if (this.state.activeGames === undefined) {
      return undefined;
    }
    for (let g of this.state.activeGames) {
      if (id === g.game.id) {
        if (g.game_html === undefined) {
          // We fetch anyway, we need the render.
          this.fetchGame(id);
        }
        return g;
      }
    }
    this.fetchGame(id);
    return undefined;
  }

  submitCommand(id: string, cmd: string) {
    this.setState({
      submittingCommand: true,
    });
    superagent
      .post(`${process.env.API_SERVER}/game/${id}/command`)
      .auth(this.state.email!, this.state.token!)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        command: cmd,
      })
      .end((err, res) => {
        if (res.unauthorized) {
          this.handleLogout();
          return;
        } else if (res.badRequest) {
          this.setState({
            submittingCommand: false,
            commandError: res.text,
          });
          console.log(this.state);
          return;
        } else if (err || !res.ok) {
          this.setState({
            submittingCommand: false,
            commandError: 'Error sending command to brdg.me server, please try again',
          });
          return;
        }
        this.setState({
          submittingCommand: false,
          commandError: undefined,
          /*commandInputState: Draft.EditorState.push(
            this.state.commandInputState,
            Draft.ContentState.createFromText(''),
            'delete-character',
          ),*/
        });
        this.updateGameState(res.body);
      });
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
            game={this.findGame(remaining.substr(1))}
            layout={this.layoutProps()}
            onCommand={(cmd) => this.submitCommand(remaining.substr(1), cmd)}
            submittingCommand={this.state.submittingCommand}
            commandError={this.state.commandError}
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

interface MyWindow extends Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: Function,
}
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;
declare var window: MyWindow;
const sagaMiddleware = createSagaMiddleware();
ReactDOM.render(
  <ReactRedux.Provider store={Redux.createStore(
    App,
    new State(),
    composeEnhancers(Redux.applyMiddleware(
      sagaMiddleware,
    )))}>
    <Brdgme />
  </ReactRedux.Provider >,
  document.body,
);
sagaMiddleware.run(mySaga);