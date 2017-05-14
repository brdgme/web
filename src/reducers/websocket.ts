import * as Immutable from "immutable";

export enum ConnectionState {
  Connecting,
  Connected,
  WaitingForReconnect,
}

export class State extends Immutable.Record({
  connected: false,
  secondsBeforeReconnect: undefined,
  subUser: undefined,
  subGames: Immutable.List(),
}) {
  public connectionState: ConnectionState;
  public secondsBeforeReconnect?: number;
  public subUser?: string;
  public subGame?: string;
}

export const CONNECTED = "brdgme/websocket/CONNECTED";
export const CONNECTING = "brdgme/websocket/CONNECTING";
export const WAITING_FOR_RECONNECT = "brdgme/websocket/WAITING_FOR_RECONNECT";
export const SUBSCRIBE_USER = "brdgme/websocket/SUBSCRIBE_USER";
export const UNSUBSCRIBE_USER = "brdgme/websocket/UNSUBSCRIBE_USER";
export const SUBSCRIBE_GAME = "brdgme/websocket/SUBSCRIBE_GAME";
export const UNSUBSCRIBE_GAME = "brdgme/websocket/UNSUBSCRIBE_GAME";

export interface IConnected { type: "brdgme/websocket/CONNECTED"; }
export const connected = (): IConnected => ({ type: CONNECTED });

export interface IConnecting { type: "brdgme/websocket/CONNECTING"; }
export const connecting = (): IConnecting => ({ type: CONNECTING });

export interface IWaitingForReconnect {
  type: "brdgme/websocket/WAITING_FOR_RECONNECT";
  payload: number;
}
export const waitingForReconnect = (waitSeconds: number): IWaitingForReconnect => ({
  type: WAITING_FOR_RECONNECT,
  payload: waitSeconds,
});

export interface ISubscribeUser {
  type: "brdgme/websocket/SUBSCRIBE_USER";
  payload: string;
}
export const subscribeUser = (token: string): ISubscribeUser => ({
  type: SUBSCRIBE_USER,
  payload: token,
});

export interface IUnsubscribeUser { type: "brdgme/websocket/UNSUBSCRIBE_USER"; }
export const unsubscribeUser = (): IUnsubscribeUser => ({ type: UNSUBSCRIBE_USER });

export interface ISubscribeGame {
  type: "brdgme/websocket/SUBSCRIBE_GAME";
  payload: string;
}
export const subscribeGame = (id: string): ISubscribeGame => ({
  type: SUBSCRIBE_GAME,
  payload: id,
});

export interface IUnsubscribeGame { type: "brdgme/websocket/UNSUBSCRIBE_GAME"; }
export const unsubscribeGame = (): IUnsubscribeGame => ({ type: UNSUBSCRIBE_GAME });

export type IAction
  = IConnected
  | IConnecting
  | IWaitingForReconnect
  | ISubscribeUser
  | IUnsubscribeUser
  | ISubscribeGame
  | IUnsubscribeGame
  ;

export function reducer(state = new State(), action: IAction): State {
  switch (action.type) {
    case CONNECTING:
      return state.set("connectionState", ConnectionState.Connecting) as State;
    case CONNECTED:
      return state
        .set("connectionState", ConnectionState.Connected)
        .remove("secondsBeforeReconnect") as State;
    case WAITING_FOR_RECONNECT:
      return state
        .set("connectionState", ConnectionState.WaitingForReconnect)
        .set("secondsBeforeReconnect", action.payload) as State;
    case SUBSCRIBE_USER:
      return state.set("subUser", action.payload) as State;
    case UNSUBSCRIBE_USER:
      return state.remove("subUser") as State;
    case SUBSCRIBE_GAME:
      return state.set("subGame", action.payload) as State;
    case UNSUBSCRIBE_GAME:
      return state.remove("subGame") as State;
  }
}
