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

const IndexRoute = () => <Redirect to={{
  pathname: '/login'
}} />;

const LoginRoute = () => <Login />;

ReactDOM.render(
  <Router>
    <div>
      <Route path="/login" component={LoginRoute} />
      <Route exact path="/" component={IndexRoute} />
    </div>
  </Router>,
  document.getElementById("brdgme")
);