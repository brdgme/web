import * as React from "react";
import * as superagent from 'superagent';

import { Layout, LayoutProps } from '../layout';

export interface GameIndexProps {
  layout: LayoutProps,
}

export interface GameIndexState { }

export class GameIndex extends React.Component<GameIndexProps, GameIndexState> {
  render() {
    return (
      <Layout
        {...this.props.layout}
      >
        <h1>Game index</h1>
      </Layout>
    );
  }
}

