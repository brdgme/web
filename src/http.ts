import * as superagent from "superagent";

import * as Model from "./model";

export async function submitLoginEmail(email: string): Promise<{}> {
  return superagent
    .post(`${process.env.API_SERVER}/auth`)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send({ email });
}

export async function submitLoginCode(email: string, code: string): Promise<string> {
  return superagent
    .post(`${process.env.API_SERVER}/auth/confirm`)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send({ email, code })
    .then((res) => res.body as string);
}

export async function fetchActiveGames(token: string): Promise<Model.IGameExtended[]> {
  return superagent
    .get(`${process.env.API_SERVER}/game/my_active`)
    .auth(token, "")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .then((res) => res.body.games as Model.IGameExtended[]);
}

export async function fetchGame(id: string, token?: string): Promise<Model.IGameExtended> {
  return superagent
    .get(`${process.env.API_SERVER}/game/${id}`)
    .auth(token || "", "")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .then((res) => res.body as Model.IGameExtended);
}

export async function submitGameCommand(id: string, command: string, token: string): Promise<Model.IGameExtended> {
  return superagent
    .post(`${process.env.API_SERVER}/game/${id}/command`)
    .auth(token, "")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send({ command })
    .then((res) => res.body as Model.IGameExtended);
}
