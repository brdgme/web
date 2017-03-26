import * as React from "react";
import * as ReactDOM from "react-dom";
import './style.less';

import * as Router from './Router';
import { Login } from "./components/Login";

interface BrdgmeState {
  email?: string,
  token?: string,
  path: string,
}

const emailLSOffset = 'email';
const tokenLSOffset = 'token';

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

  handleLogin(email: string, token: string) {
    this.handleTokenChange(token);
    this.handleEmailChange(email);
    this.redirect('/');
  }

  render() {
    return Router.first(this.state.path, [
      Router.prefix('/', (remaining) => Router.first(remaining, [
        Router.match('login', () => <Login
          initialEmail={this.state.email}
          onLogin={this.handleLogin}
        />),
        Router.empty(() => <div>
          <div>Logged in</div>
          <div>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              this.handleTokenChange(null);
            }}>Logout</a>
          </div>
        </div>),
      ])),
    ]) || <div>
        Page not found.
    </div>;
  }
}

ReactDOM.render(
  <Brdgme />,
  document.body,
);