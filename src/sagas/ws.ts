import { END, eventChannel } from "redux-saga";
import { call, Effect, fork, put, select, take, takeEvery, takeLatest } from "redux-saga/effects";

import * as http from "../http";
import * as Records from "../records";
import { State as AppState } from "../reducers";
import * as Game from "../reducers/game";
import * as Session from "../reducers/session";
import * as WS from "../reducers/ws";

export const LS_AUTH_TOKEN_OFFSET = "token";

async function sleep(ms: number): Promise<{}> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function* sagas(): IterableIterator<Effect> {
  yield fork(wsSaga);
  yield takeEvery(Session.UPDATE_TOKEN, updateToken);
  yield takeEvery(Session.CLEAR_TOKEN, clearToken);
}

export function* updateToken(action: Session.IUpdateToken): IterableIterator<Effect> {
  yield put(WS.subscribeUser(action.payload));
}

export function* clearToken(action: Session.IClearToken): IterableIterator<Effect> {
  yield put(WS.unsubscribeUser());
}

export function* wsSaga(): IterableIterator<Effect> {
  while (true) {
    console.log("looping here");
    try {
      const socket: WebSocket = yield call(connect, process.env.WS_SERVER);
      const state: AppState = yield select();
      const s = yield fork(socketSagas, socket);
      if (state.ws.subUser !== undefined) {
        sendAction(socket, WS.subscribeUser(state.ws.subUser));
      }
      if (state.ws.subGame !== undefined) {
        sendAction(socket, WS.subscribeGame(state.ws.subGame));
      }
      console.log("starting loop");
      while (true) {
        yield s;
      }
    } catch (e) {
      console.log(e);
    }
    // Wait before reconnecting.
    yield call(sleep, 1000);
  }
}

export function* handleMessages(socket: WebSocket): IterableIterator<Effect> {
  console.log("getting channel");
  const chan = yield call(messageChannel, socket);
  console.log("got channel");
  while (true) {
    console.log("waiting for message");
    const message: MessageEvent = yield take(chan);
    console.log(message.data);
    yield put(Game.updateGames(Records.GameExtended.fromJSList([message.data])));
  }
}

export function messageChannel(socket: WebSocket) {
  return eventChannel((emitter) => {
    const listener = (event: MessageEvent) => {
      emitter(event.data);
    };
    socket.addEventListener("message", listener);
    socket.addEventListener("close", () => emitter(END));
    return () => {
      socket.removeEventListener("message", listener);
    };
  });
}

function connect(addr: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(addr);
    socket.addEventListener("open", (event) => resolve(socket));
    socket.addEventListener("error", (event) => reject(event));
  });
}

function* socketSagas(socket: WebSocket): IterableIterator<Effect> {
  yield fork(handleMessages, socket);
  yield takeEvery([
    WS.SUBSCRIBE_GAME,
    WS.UNSUBSCRIBE_GAME,
    WS.SUBSCRIBE_USER,
    WS.UNSUBSCRIBE_USER,
  ], handleWSAction(socket));
}

function handleWSAction(socket: WebSocket) {
  return function*(action: WS.Action): IterableIterator<Effect> {
    sendAction(socket, action);
  };
}

function sendAction(socket: WebSocket, action: WS.Action) {
  console.log(`sending ${JSON.stringify(action)}`);
  socket.send(JSON.stringify(action));
}
