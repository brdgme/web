import * as React from 'react';

import * as Model from '../model';
import * as Router from '../router';
import { Container as Login } from './login';

interface Props {
  path: string,
  session?: Model.Session,
}
export class Component extends React.PureComponent<Props, {}> {
  render() {
    return Router.first(this.props.path, [
      Router.match('/login', () => <Login />),
      /*Router.prefix('/game', (remaining) =>
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
      )
      />*/
      Router.any(() => <div>404</div>),
    ]);
  }
}