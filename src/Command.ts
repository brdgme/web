export interface CommandSpecs {
  entry: CommandSpec,
  specs: { [id: string]: CommandSpec },
}

export interface CommandSpec {
  kind: {
    Int?: { min: number, max: number },
    Token?: string,
    Ref?: string,
    Enum?: string[],
    OneOf?: CommandSpec[],
    Chain?: CommandSpec[],
  },
  min: number,
  max?: number,
  description?: string,
}

export enum ParseResultKind {
  Success,
  Error,
}

export interface ParseSuccess<T> {
  kind: ParseResultKind.Success,
  match: Match<T>,
  consumed: string,
  remaining: string,
}

export enum MatchKind {
  Full,
  Partial,
}

export interface FullMatch<T> {
  kind: MatchKind.Full,
  value: T,
}
export interface PartialMatch<T> {
  kind: MatchKind.Partial,
  potentialValues: T[],
}
export type Match<T> = FullMatch<T> | PartialMatch<T>;

export interface ParseError {
  kind: ParseResultKind.Error,
  message: string,
}

export type ParseResult<T> = ParseSuccess<T> | ParseError;

const intRegex = /\-?\d+/;
export function parseIntSpec(input: string, min: number, max: number): ParseResult<number> {
  const matches = intRegex.exec(input);
  if (matches) {
    const value = parseInt(matches[0]);
    if (min !== null && value < min) {
      return {
        kind: ParseResultKind.Error,
        message: `${value} is less than the minimum ${min}`,
      };
    }
    if (max !== null && value > max) {
      return {
        kind: ParseResultKind.Error,
        message: `${value} is greater than the maximum ${max}`,
      };
    }
    return {
      kind: ParseResultKind.Success,
      match: { kind: MatchKind.Full, value: parseInt(matches[0]) },
      consumed: matches[0],
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

export function parseEnum(input: string, values: string[]): ParseResult<string> {
  let partialMatches: string[] = [];
  let consumed = '';
  for (const v of values) {
    const result = parseToken(input, v);
    if (result.kind === ParseResultKind.Success) {
      switch (result.match.kind) {
        case MatchKind.Full:
          return result;
        case MatchKind.Partial:
          let value = result.match.potentialValues[0];
          let newCLen = result.consumed.length;
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
        message: `input doesn't match any value in: ${values.join(', ')}`,
      };
    case 1:
      return {
        kind: ParseResultKind.Success,
        match: {
          kind: MatchKind.Full,
          value: partialMatches[0],
        },
        consumed: consumed,
        remaining: input.substr(consumed.length),
      }
    default:
      return {
        kind: ParseResultKind.Success,
        match: {
          kind: MatchKind.Partial,
          potentialValues: partialMatches,
        },
        consumed: consumed,
        remaining: input.substr(consumed.length),
      }
  }
}

export function parseToken(input: string, token: string): ParseResult<string> {
  const tLen = token.length;
  if (tLen === 0) {
    return {
      kind: ParseResultKind.Success,
      match: { kind: MatchKind.Full, value: '' },
      consumed: '',
      remaining: input,
    };
  }
  const inputTrimmed = input.substr(0, tLen);
  const prefix = commonPrefix(inputTrimmed.toLowerCase(), token.toLowerCase());
  const prefixLen = prefix.length;
  if (prefixLen === tLen) {
    return {
      kind: ParseResultKind.Success,
      match: { kind: MatchKind.Full, value: token },
      consumed: inputTrimmed,
      remaining: input.substr(tLen),
    };
  }
  if (prefixLen > 0) {
    return {
      kind: ParseResultKind.Success,
      match: { kind: MatchKind.Partial, potentialValues: [token] },
      consumed: inputTrimmed.substr(0, prefixLen),
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
  let matches = whiteSpaceRegex.exec(input);
  if (matches) {
    return {
      kind: ParseResultKind.Success,
      match: { kind: MatchKind.Full, value: matches[0] },
      consumed: matches[0],
      remaining: input.substr(matches[0].length),
    };
  }
  return {
    kind: ParseResultKind.Error,
    message: 'whitespace not found',
  };
}

export function parse(input: string, spec: CommandSpec, specs: CommandSpecs): ParseResult<string> {
  return {
    kind: ParseResultKind.Error,
    message: 'not implemented',
  };
}