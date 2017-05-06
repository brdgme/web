import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactRedux from "react-redux";
import * as Redux from "redux";
import createSagaMiddleware from "redux-saga";

import sagas from "./sagas";
import { LS_AUTH_TOKEN_OFFSET } from "./sagas/session";

import "./style.less"; // tslint:disable-line

import { Container as AppContainer } from "./components/app";
import { reducer as App, State } from "./reducers";

interface IMyWindow extends Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: <R>(a: R) => R;
}
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;
declare var window: IMyWindow;
const sagaMiddleware = createSagaMiddleware();
ReactDOM.render(
  <ReactRedux.Provider store={Redux.createStore(
    App,
    new State().updateIn(
      ["session", "token"],
      () => localStorage.getItem(LS_AUTH_TOKEN_OFFSET) || undefined,
    ) as State,
    composeEnhancers(Redux.applyMiddleware(
      sagaMiddleware,
    )))}>
    <AppContainer />
  </ReactRedux.Provider >,
  document.body,
);
sagaMiddleware.run(sagas);
