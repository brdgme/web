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

    this.state = {
      email: localStorage.getItem(emailLSOffset),
      token: localStorage.getItem(tokenLSOffset),
      path: window.location.pathname,
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
    if (this.state.token === null && this.state.path !== '/login') {
      this.redirect('/login');
    }
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