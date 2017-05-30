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

export interface IParseResult {
  kind: typeof MATCH_FULL | typeof MATCH_PARTIAL | typeof MATCH_ERROR;
  offset: number;
  length?: number;
  next?: IParseResult[];
  value?: string;
  name?: string;
  desc?: string;
  message?: string;
}

// Match kinds are ordered strings so that FULL > PARTIAL > ERROR
export const MATCH_FULL = "2_MATCH_FULL";
export const MATCH_PARTIAL = "1_MATCH_PARTIAL";
export const MATCH_ERROR = "0_MATCH_ERROR";

const intRegex = /\-?\d+/;
export function parseIntSpec(input: string, offset: number, min?: number, max?: number): IParseResult {
  if (offset >= input.length) {
    return {
      kind: MATCH_PARTIAL,
      offset,
    };
  }
  const matches = intRegex.exec(input.substr(offset));
  if (matches) {
    const value = parseInt(matches[0], 10);
    if (min !== undefined && value < min) {
      return {
        kind: MATCH_ERROR,
        offset,
        message: `${value} is less than the minimum ${min}`,
      };
    }
    if (max !== undefined && value > max) {
      return {
        kind: MATCH_ERROR,
        offset,
        message: `${value} is greater than the maximum ${max}`,
      };
    }
    return {
      kind: MATCH_FULL,
      offset,
      length: matches[0].length,
      value: matches[0],
    };
  }
  return {
    kind: MATCH_ERROR,
    offset,
    message: "expected a number",
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

export function parseEnum(input: string, offset: number, values: string[], exact: boolean): IParseResult {
  let matches: IParseResult[] = [];
  let length = 0;
  for (const v of values) {
    const result = parseToken(input, offset, v);
    if (result.kind !== MATCH_ERROR) {
      const matchLen = result.length || 0;
      if (matchLen > length) {
        matches = [];
        length = matchLen;
      }
      if (matchLen === length) {
        matches.push(result);
      }
    }
  }

  switch (matches.length) {
    case 0:
      return {
        kind: MATCH_ERROR,
        offset,
        message: `input doesn't match any value in: ${values.join(", ")}`,
      };
    case 1:
      return matches[0];
    default:
      for (const m of matches) {
        if (m.kind === MATCH_FULL) {
          return m;
        }
      }
      // Because we have multiple partial matches, we return this as a zero
      // length full match with all the partial matches as children.
      return {
        kind: MATCH_FULL,
        offset,
        next: matches,
      };
  }
}

export function parseToken(input: string, offset: number, token: string): IParseResult {
  if (offset >= input.length) {
    return {
      kind: MATCH_PARTIAL,
      offset,
      value: token,
    };
  }
  const tLen = token.length;
  if (tLen === 0) {
    return {
      kind: MATCH_FULL,
      offset,
      value: "",
    };
  }
  const prefix = commonPrefix(input.substr(offset, tLen).toLowerCase(), token.toLowerCase());
  const prefixLen = prefix.length;
  if (prefixLen === 0) {
    return {
      kind: MATCH_ERROR,
      offset,
      message: `'${token}' not found`,
    };
  }
  return {
    kind: tLen === prefixLen && MATCH_FULL || MATCH_PARTIAL,
    offset,
    length: prefixLen,
    value: token,
  };
}

const whiteSpaceRegex = /^\s*/;
export function parseWhitespace(input: string, offset: number): IParseResult {
  const matches = whiteSpaceRegex.exec(input.substr(offset));
  if (matches) {
    return {
      kind: MATCH_FULL,
      offset,
      value: matches[0],
      length: matches[0].length,
    };
  }
  return {
    kind: MATCH_ERROR,
    offset,
    message: "whitespace not found",
  };
}

export function parseOneOf(input: string, offset: number, specs: ICommandSpec[]): IParseResult {
  let success = 0;
  const results: IParseResult[] = specs.map((s) => {
    const res = parse(input, offset, s);
    if (res.kind !== MATCH_ERROR) {
      success++;
    }
    return res;
  });
  return {
    kind: MATCH_FULL,
    offset,
    next: results,
  };
}

export function parseDoc(input: string, offset: number, name: string, spec: ICommandSpec, desc?: string): IParseResult {
  return {
    kind: MATCH_FULL,
    offset,
    name,
    desc,
    next: [parse(input, offset, spec)],
  };
}

export interface IFlatResult {
  flat: IParseResult;
  combined: IParseResult;
}
/**
 * Flattens a result into the best matching branch, as well as a combined
 * version of the best matching branch.
 */
export function flattenResult(result: IParseResult): IFlatResult {
  if (result.kind !== MATCH_FULL || result.next === undefined || result.next.length === 0) {
    return {
      flat: result,
      combined: result,
    };
  }
  let best: IFlatResult | undefined;
  for (const n of result.next) {
    const nFlat = flattenResult(n);
    if (best === undefined
      || nFlat.combined.kind > best.combined.kind
      || (
        nFlat.combined.kind === best.combined.kind
        && (nFlat.combined.length || 0) > (best.combined.length || 0)
      )
    ) {
      best = nFlat;
    }
  }
  return {
    flat: Object.assign({}, result, {
      next: [best!.flat],
    }),
    combined: Object.assign({}, result, best, {
      kind: best!.combined.kind,
      offset: result.offset,
      length: (result.length || 0) + (best!.combined.length || 0),
      value: (result.value || "") + (best!.combined.value || ""),
    }),
  };
}

/**
 * Appends the result as leaves to every branch of the tree.
 */
export function pushResult(result: IParseResult, to: IParseResult): IParseResult {
  if (to.next === undefined || to.next.length === 0) {
    return Object.assign({}, to, {
      next: [result],
    });
  }
  return Object.assign({}, to, {
    next: to.next.map((n) => pushResult(result, n)),
  });
}

export function suggestions(result: IParseResult, at: number): string[] {
  let s = [];
  if (result.kind !== MATCH_ERROR && (result.next === undefined || result.next.length === 0)) {
    const offset = result.offset || 0;
    const length = result.length || 0;
    if (result.value !== undefined && offset <= at && offset + length >= at) {
      s.push(result.value);
    }
  }
  if (result.next !== undefined) {
    for (const n of result.next) {
      s = s.concat(suggestions(n, at));
    }
  }
  return s;
}

export function parseChain(
  input: string,
  offset: number,
  specs: ICommandSpec[],
  leadingWhitespace?: boolean,
): IParseResult {
  if (specs.length === 0) {
    return {
      kind: MATCH_FULL,
      offset,
    };
  }
  let whitespaceLen = 0;
  if (leadingWhitespace === true) {
    const whitespace = parseWhitespace(input, offset);
    whitespaceLen = whitespace.length || 0;
  }
  const head = specs[0];
  const tail = specs.slice(1);
  const result = parse(input, offset + whitespaceLen, head);
  const flatResult = flattenResult(result);
  if (leadingWhitespace && whitespaceLen === 0 && (flatResult.combined.length || 0) !== 0) {
    // We parsed the next segment, but we didn't parse any whitespace inbetween!
    // This is an error.
    return {
      kind: MATCH_ERROR,
      offset,
      message: "should follow a space",
    };
  }
  if (flatResult.combined.kind !== MATCH_FULL || tail.length === 0) {
    // No full match on this link of the chain or end of the chain, exit here.
    return result;
  }
  const headLen = flatResult.combined.length || 0;
  return pushResult(
    parseChain(input, offset + whitespaceLen + headLen, tail, headLen > 0),
    flatResult.flat,
  );
}

export function parse(input: string, offset: number, spec: ICommandSpec): IParseResult {
  if (spec.Int !== undefined) {
    return parseIntSpec(input, offset, spec.Int.min, spec.Int.max);
  } else if (spec.Token !== undefined) {
    return parseToken(input, offset, spec.Token);
  } else if (spec.Enum !== undefined) {
    return parseEnum(input, offset, spec.Enum.values, spec.Enum.exact);
  } else if (spec.OneOf !== undefined) {
    return parseOneOf(input, offset, spec.OneOf);
  } else if (spec.Chain !== undefined) {
    return parseChain(input, offset, spec.Chain);
  } else if (spec.Many !== undefined) {
    return {
      kind: MATCH_ERROR,
      offset,
      message: "Many not implemented",
    };
  } else if (spec.Opt !== undefined) {
    return {
      kind: MATCH_ERROR,
      offset,
      message: "Opt not implemented",
    };
  } else if (spec.Doc !== undefined) {
    return parseDoc(input, offset, spec.Doc.name, spec.Doc.spec, spec.Doc.desc);
  } else if (spec.Player !== undefined) {
    return {
      kind: MATCH_ERROR,
      offset,
      message: "Player not implemented",
    };
  }
  return {
    kind: MATCH_ERROR,
    offset,
    message: "invalid command spec",
  };
}
