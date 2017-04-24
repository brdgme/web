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

export interface CommandParseResult {
  isOk: boolean,
  errorMessage: string,
  autocomplete: string[],
  isComplete: boolean,
}

export interface ParseSuccess<T> {
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
  potentialValues: [T],
}
export type Match<T> = FullMatch<T> | PartialMatch<T>;

export type ParseError = string;

export type ParseResult<T> = ParseSuccess<T> | ParseError;

const intRegex = /\-?\d+/;
export function parseIntSpec(input: string, min: number, max: number): ParseResult<number> {
  const matches = intRegex.exec(input);
  if (matches) {
    const value = parseInt(matches[0]);
    if (min !== null && value < min) {
      return `${value} is less than the minimum ${min}`;
    }
    if (max !== null && value > max) {
      return `${value} is greater than the maximum ${max}`;
    }
    return {
      match: { value: parseInt(matches[0]) } as FullMatch<number>,
      consumed: matches[0],
      remaining: input.substr(matches[0].length),
    }
  }
  return "int not found";
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

export function parseToken(input: string, token: string): ParseResult<string> {
  const tLen = token.length;
  if (tLen === 0) {
    return {
      match: { value: '' } as FullMatch<string>,
      consumed: '',
      remaining: input,
    };
  }
  const inputTrimmed = input.substr(0, tLen);
  const prefix = commonPrefix(inputTrimmed.toLowerCase(), token.toLowerCase());
  const prefixLen = prefix.length;
  if (prefixLen === tLen) {
    return {
      match: { value: token } as FullMatch<string>,
      consumed: inputTrimmed,
      remaining: input.substr(tLen),
    };
  }
  if (prefixLen > 0) {
    return {
      match: { potentialValues: [token] } as PartialMatch<string>,
      consumed: inputTrimmed.substr(0, prefixLen),
      remaining: input.substr(prefixLen),
    }
  }
  return `token '${token}' not found`;
}

const whiteSpaceRegex = /^\s*/;
export function parseWhitespace(input: string): ParseResult<string> {
  let matches = whiteSpaceRegex.exec(input);
  if (matches) {
    return {
      match: { value: matches[0] } as FullMatch<string>,
      consumed: matches[0],
      remaining: input.substr(matches[0].length),
    };
  }
  return 'whitespace not found';
}

export function parse(input: string, spec: CommandSpec, specs: CommandSpecs): CommandParseResult {
  return null;
}