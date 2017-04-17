import * as React from "react";
import * as superagent from 'superagent';

import { Layout, LayoutProps } from '../Layout';

export interface GameShowProps {
  id: string,
  layout: LayoutProps,
}

export interface GameShowState { }

export class GameShow extends React.Component<GameShowProps, GameShowState> {
  render() {
    return (
      <Layout
        {...this.props.layout}
      >
        <div className="game-render">Game</div>
        <div className="game-overview">Game overview</div>
      </Layout>
    );
  }
}
