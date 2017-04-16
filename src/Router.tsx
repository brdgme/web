type Handler<T> = (input: string) => T | null;

export function first<T>(
  input: string,
  handlers: Array<Handler<T>>,
): T | null {
  for (let h of handlers) {
    let res = h(input);
    if (res !== null) {
      return res;
    }
  }
  return null;
}

export function prefix<T>(
  p: string,
  success: (remaining: string) => T | null,
): Handler<T> {
  return (input: string) => {
    if (input.substr(0, p.length) === p) {
      return success(input.substr(p.length));
    }
    return null;
  };
}

export function match<T>(
  p: string,
  success: () => T | null,
): Handler<T> {
  return (input: string) => {
    if (input === p) {
      return success();
    }
    return null;
  };
}

export function empty<T>(
  success: () => T | null,
): Handler<T> {
  return match('', success);
}

export function any<T>(
  success: () => T | null,
): Handler<T> {
  return (input: string) => {
    return success();
  };
}

const intRegex = /^-?[0-9]+/;
export function int<T>(
  success: (n: number, remaining: string) => T | null,
): Handler<T> {
  return (input: string) => {
    let res = intRegex.exec(input);
    if (res === null) {
      return null;
    }
    return success(parseInt(res[0]), input.substr(res[0].length));
  };
}