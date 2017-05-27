export interface ICommandSpec {
  Int?: { min?: number, max?: number };
  Token?: string;
  Enum?: { values: string[], exact: boolean };
  OneOf?: ICommandSpec[];
  Chain?: ICommandSpec[];
  Many?: { min?: number, max?: number, delim: string, spec: ICommandSpec };
  Opt?: ICommandSpec;
  Doc?: { name: string, desc?: string, spec: ICommandSpec };
  Player?: {};
}

export enum ParseResultKind {
  Success,
  Error,
}

export interface IParseSuccess<T> {
  kind: ParseResultKind.Success;
  match: Match<T>;
  consumed: string;
  remaining: string;
}

export enum MatchKind {
  Full,
  Partial,
}

export interface IFullMatch<T> {
  kind: MatchKind.Full;
  value: T;
}
export interface IPartialMatch<T> {
  kind: MatchKind.Partial;
  potentialValues: T[];
}
export type Match<T> = IFullMatch<T> | IPartialMatch<T>;

export interface IParseError {
  kind: ParseResultKind.Error;
  message: string;
}

export type ParseResult<T> = IParseSuccess<T> | IParseError;

const intRegex = /\-?\d+/;
export function parseIntSpec(input: string, min?: number, max?: number): ParseResult<number> {
  const matches = intRegex.exec(input);
  if (matches) {
    const value = parseInt(matches[0], 10);
    if (min !== undefined && value < min) {
      return {
        kind: ParseResultKind.Error,
        message: `${value} is less than the minimum ${min}`,
      };
    }
    if (max !== undefined && value > max) {
      return {
        kind: ParseResultKind.Error,
        message: `${value} is greater than the maximum ${max}`,
      };
    }
    return {
      consumed: matches[0],
      kind: ParseResultKind.Success,
      match: { kind: MatchKind.Full, value: parseInt(matches[0], 10) },
      remaining: input.substr(matches[0].length),
    };
  }
  return {
    kind: ParseResultKind.Error,
    message: "int not found",
  };
}

export function commonPrefix(s1: string, s2: string): string {
  const iterBound = Math.min(s1.length, s2.length);
  for (let i = 0; i < iterBound; i++) {
    if (s1.charAt(i) !== s2.charAt(i)) {
      return s1.substr(0, i);
    }
  }
  return s1.substr(0, iterBound);
}

export function parseEnum(input: string, values: string[], exact: boolean): ParseResult<string> {
  let partialMatches: string[] = [];
  let consumed = "";
  for (const v of values) {
    const result = parseToken(input, v);
    if (result.kind === ParseResultKind.Success) {
      switch (result.match.kind) {
        case MatchKind.Full:
          return result;
        case MatchKind.Partial:
          const value = result.match.potentialValues[0];
          const newCLen = result.consumed.length;
          let cLen = consumed.length;
          if (newCLen > cLen) {
            partialMatches = [];
            consumed = result.consumed;
            cLen = newCLen;
          }
          if (newCLen === cLen) {
            partialMatches.push(value);
          }
          break;
      }
    }
  }

  switch (partialMatches.length) {
    case 0:
      return {
        kind: ParseResultKind.Error,
        message: `input doesn't match any value in: ${values.join(", ")}`,
      };
    case 1:
      return {
        kind: ParseResultKind.Success,
        match: {
          kind: MatchKind.Full,
          value: partialMatches[0],
        },
        consumed,
        remaining: input.substr(consumed.length),
      };
    default:
      return {
        kind: ParseResultKind.Success,
        match: {
          kind: MatchKind.Partial,
          potentialValues: partialMatches,
        },
        consumed,
        remaining: input.substr(consumed.length),
      };
  }
}

export function parseToken(input: string, token: string): ParseResult<string> {
  const tLen = token.length;
  if (tLen === 0) {
    return {
      consumed: "",
      kind: ParseResultKind.Success,
      match: { kind: MatchKind.Full, value: "" },
      remaining: input,
    };
  }
  const inputTrimmed = input.substr(0, tLen);
  const prefix = commonPrefix(inputTrimmed.toLowerCase(), token.toLowerCase());
  const prefixLen = prefix.length;
  if (prefixLen === tLen) {
    return {
      consumed: inputTrimmed,
      kind: ParseResultKind.Success,
      match: { kind: MatchKind.Full, value: token },
      remaining: input.substr(tLen),
    };
  }
  if (prefixLen > 0) {
    return {
      consumed: inputTrimmed.substr(0, prefixLen),
      kind: ParseResultKind.Success,
      match: { kind: MatchKind.Partial, potentialValues: [token] },
      remaining: input.substr(prefixLen),
    };
  }
  return {
    kind: ParseResultKind.Error,
    message: `token '${token}' not found`,
  };
}

const whiteSpaceRegex = /^\s*/;
export function parseWhitespace(input: string): ParseResult<string> {
  const matches = whiteSpaceRegex.exec(input);
  if (matches) {
    return {
      consumed: matches[0],
      kind: ParseResultKind.Success,
      match: { kind: MatchKind.Full, value: matches[0] },
      remaining: input.substr(matches[0].length),
    };
  }
  return {
    kind: ParseResultKind.Error,
    message: "whitespace not found",
  };
}

export function parseOneOf(input: string, specs: ICommandSpec[]): ParseResult<string | number> {
  for (const spec of specs) {
    const res = parse(input, spec);
    if (res.kind === ParseResultKind.Success) {
      return res;
    }
  }
  return {
    kind: ParseResultKind.Error,
    message: "no match",
  };
}

export function parseDoc(input: string, name: string, spec: ICommandSpec, desc?: string): ParseResult<string | number> {
  return parse(input, spec);
}

export function parseChain(input: string, specs: ICommandSpec[]): ParseResult<Array<string | number>> {
  let remaining = input;
  let consumed = "";
  const matches: Array<string | number> = [];
  for (const spec of specs) {
    const res = parse(remaining, spec);
    if (res.kind === ParseResultKind.Error) {
      return res;
    }
    if (res.match.kind === MatchKind.Partial) {
      // Handle partial
    }
    remaining = res.remaining;
    consumed += res.consumed;
    /// matches.push(res.match);
  }
  return {
    kind: ParseResultKind.Success,
    match: {
      kind: MatchKind.Full,
      value: matches,
    },
    consumed,
    remaining,
  };
}

export function parse(input: string, spec: ICommandSpec): ParseResult<string | number> {
  if (spec.Int !== undefined) {
    return parseIntSpec(input, spec.Int.min, spec.Int.max);
  } else if (spec.Token !== undefined) {
    return parseToken(input, spec.Token);
  } else if (spec.Enum !== undefined) {
    return parseEnum(input, spec.Enum.values, spec.Enum.exact);
  } else if (spec.OneOf !== undefined) {
    return parseOneOf(input, spec.OneOf);
  } else if (spec.Chain !== undefined) {
    return {
      kind: ParseResultKind.Error,
      message: "Chain not implemented",
    };
  } else if (spec.Many !== undefined) {
    return {
      kind: ParseResultKind.Error,
      message: "Many not implemented",
    };
  } else if (spec.Opt !== undefined) {
    return {
      kind: ParseResultKind.Error,
      message: "Opt not implemented",
    };
  } else if (spec.Doc !== undefined) {
    return parseDoc(input, spec.Doc.name, spec.Doc.spec, spec.Doc.desc);
  } else if (spec.Player !== undefined) {
    return {
      kind: ParseResultKind.Error,
      message: "Player not implemented",
    };
  }
  return {
    kind: ParseResultKind.Error,
    message: "invalid command spec",
  };
}
