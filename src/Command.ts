interface CommandSpecs {
  entry: CommandSpec,
  specs: { [id: string]: CommandSpec },
}

interface CommandSpec {
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

interface CommandParseResult {
  isOk: boolean,
  errorMessage: string,
  autocomplete: string[],
  isComplete: boolean,
}

interface ParseSuccess<T> {
  value: T,
  consumed: string,
  remaining: string,
}

type ParseError = string;

type ParseResult<T> = ParseSuccess<T> | ParseError;

const intRegex = /\-?\d+/;
function parseIntSpec(input: string, min: number, max: number): ParseResult<number> {
  const leadingWhitespace = parseWhitespace(input);
  const matches = intRegex.exec(leadingWhitespace.remaining);
  if (matches) {
    const value = parseInt(matches[0]);
    if (min !== null && value < min) {
      return `${value} is less than the minimum ${min}`;
    }
    if (max !== null && value > max) {
      return `${value} is greater than the maximum ${max}`;
    }
    return {
      value: parseInt(matches[0]),
      consumed: leadingWhitespace.consumed + matches[0],
      remaining: leadingWhitespace.remaining.substr(matches[0].length),
    }
  }
  return "int not found";
}

function parseToken(input: string, token: string): ParseResult<string> {
  const tLen = input.length;
  if (tLen === 0) {
    return {
      value: '',
      consumed: '',
      remaining: input,
    };
  }
  const leadingWhitespace = parseWhitespace(input);
  const inputPrefix = leadingWhitespace.remaining.substr(0, tLen);
  if (inputPrefix.toLowerCase() === token.toLowerCase()) {
    return {
      value: inputPrefix,
      consumed: leadingWhitespace.value + inputPrefix,
      remaining: leadingWhitespace.remaining.substr(tLen),
    };
  }
  return `token '${token}' not found`;
}

const whiteSpaceRegex = /^\s*/;
function parseWhitespace(input: string): ParseSuccess<string> {
  let matches = whiteSpaceRegex.exec(input);
  if (matches) {
    return {
      value: matches[0],
      consumed: matches[0],
      remaining: input.substr(matches[0].length),
    };
  }
  return {
    value: '',
    consumed: '',
    remaining: input,
  };
}

export function parse(input: string, spec: CommandSpec, specs: CommandSpecs): CommandParseResult {
  return null;
}