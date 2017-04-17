import * as React from "react";
import * as superagent from 'superagent';

import { Session } from '../Model';
import { Layout } from './Layout';

export interface HomeProps {
  session: Session,
}

export interface HomeState { }

export class Home extends React.Component<HomeProps, HomeState> {
  render() {
    return (
      <Layout
        session={this.props.session}
      >
        <h1>Home</h1>
      </Layout>
    );
  }
}
