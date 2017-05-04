import * as superagent from 'superagent';

export async function submitLoginEmail(email: string): Promise<{}> {
  return superagent
    .post(`${process.env.API_SERVER}/auth`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({ email });
}

export interface SubmitLoginCodeResponse {
  user_id: string,
  token: string,
}
export async function submitLoginCode(email: string, code: string): Promise<SubmitLoginCodeResponse> {
  return superagent
    .post(`${process.env.API_SERVER}/auth/confirm`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({ email, code })
    .then((res) => res.body as SubmitLoginCodeResponse);
}
