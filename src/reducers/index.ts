import { combineReducers } from 'redux-immutable';
import * as Immutable from 'immutable';

import * as Login from './login';

export class State extends Immutable.Record({
  login: new Login.State(),
}) {
  login: Login.State;
}

export const App = combineReducers({
  login: Login.reducer,
});