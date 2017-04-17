import * as React from "react";
import * as superagent from 'superagent';

import { Session } from '../Model';
import { Layout, LayoutProps } from './Layout';

export interface HomeProps {
  layout: LayoutProps,
}

export interface HomeState { }

export class Home extends React.Component<HomeProps, HomeState> {
  render() {
    return (
      <Layout
        {...this.props.layout}
      >
        <h1>Home</h1>
      </Layout>
    );
  }
}
