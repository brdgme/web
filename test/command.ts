import 'mocha';
import { assert } from 'chai';

import * as Command from '../src/Command';

describe('Command.parseWhitespace', () => {
  it('should parse leading whitespace', () => {
    assert.deepEqual({
      kind: Command.ParseResultKind.Success,
      match: {
        kind: Command.MatchKind.Full,
        value: '   '
      } as Command.FullMatch<string>,
      consumed: '   ',
      remaining: 'hello ',
    } as Command.ParseSuccess<string>, Command.parseWhitespace("   hello "));
  });
  it('should parse newlines', () => {
    assert.deepEqual({
      kind: Command.ParseResultKind.Success,
      match: {
        kind: Command.MatchKind.Full,
        value: ` 
  `
      } as Command.FullMatch<string>,
      consumed: ` 
  `,
      remaining: 'hello ',
    } as Command.ParseSuccess<string>, Command.parseWhitespace(` 
  hello `), );
  });
});

describe('Command.commonPrefix', () => {
  it('should do partial matches', () => {
    assert.equal('fart', Command.commonPrefix('fartbag', 'fartdog'));
  });
  it('should be case sensitive', () => {
    assert.equal('', Command.commonPrefix('Fartbag', 'fartdog'));
  });
  it('should match the full first string', () => {
    assert.equal('fart', Command.commonPrefix('fart', 'fartdog'));
  });
  it('should match the full second string', () => {
    assert.equal('fart', Command.commonPrefix('fartbag', 'fart'));
  });
});

describe('Command.parseToken', () => {
  it('should match full token', () => {
    assert.deepEqual({
      kind: Command.ParseResultKind.Success,
      match: {
        kind: Command.MatchKind.Full,
        value: 'fart',
      } as Command.FullMatch<string>,
      consumed: 'fart',
      remaining: '   ',
    } as Command.ParseSuccess<string>, Command.parseToken('fart   ', 'fart'));
  });
  it('should be case insensitive', () => {
    assert.deepEqual({
      kind: Command.ParseResultKind.Success,
      match: {
        kind: Command.MatchKind.Full,
        value: 'fart',
      } as Command.FullMatch<string>,
      consumed: 'FaRt',
      remaining: '   ',
    } as Command.ParseSuccess<string>, Command.parseToken('FaRt   ', 'fart'));
  });
  it('should partially match', () => {
    assert.deepEqual({
      kind: Command.ParseResultKind.Success,
      match: {
        kind: Command.MatchKind.Partial,
        potentialValues: ['fart'],
      } as Command.PartialMatch<string>,
      consumed: 'FaR',
      remaining: '   ',
    } as Command.ParseSuccess<string>, Command.parseToken('FaR   ', 'fart'));
  });
});

describe('Command.parseInt', () => {
  it('should parse positive numbers', () => {
    assert.deepEqual({
      kind: Command.ParseResultKind.Success,
      match: {
        kind: Command.MatchKind.Full,
        value: 264,
      } as Command.FullMatch<number>,
      consumed: '264',
      remaining: '   ',
    } as Command.ParseSuccess<number>, Command.parseIntSpec('264   ', null, null));
  });
  it('should parse negative numbers', () => {
    assert.deepEqual({
      kind: Command.ParseResultKind.Success,
      match: {
        kind: Command.MatchKind.Full,
        value: -264,
      } as Command.FullMatch<number>,
      consumed: '-264',
      remaining: '   ',
    } as Command.ParseSuccess<number>, Command.parseIntSpec('-264   ', null, null));
  });
  it('should parse numbers above min', () => {
    assert.deepEqual({
      kind: Command.ParseResultKind.Success,
      match: {
        kind: Command.MatchKind.Full,
        value: -264,
      } as Command.FullMatch<number>,
      consumed: '-264',
      remaining: '   ',
    } as Command.ParseSuccess<number>, Command.parseIntSpec('-264   ', -300, null));
  });
  it('should fail to parse numbers below min', () => {
    assert.equal(Command.ParseResultKind.Error, Command.parseIntSpec('-264   ', -20, null).kind);
  });
  it('should parse numbers below max', () => {
    assert.deepEqual({
      kind: Command.ParseResultKind.Success,
      match: {
        kind: Command.MatchKind.Full,
        value: -264,
      },
      consumed: '-264',
      remaining: '   ',
    } as Command.ParseSuccess<number>, Command.parseIntSpec('-264   ', null, -5));
  });
  it('should fail to parse numbers above max', () => {
    assert.equal(Command.ParseResultKind.Error, Command.parseIntSpec('-264   ', null, -300).kind);
  });
});

describe('Command.parseEnum', () => {
  it('should full match exact matches', () => {
    assert.deepEqual({
      kind: Command.ParseResultKind.Success,
      match: {
        kind: Command.MatchKind.Full,
        value: 'fart',
      },
      consumed: 'Fart',
      remaining: 'bag',
    } as Command.ParseSuccess<string>, Command.parseEnum('Fartbag', ['fart', 'Fartb']));
  });
  it('should partial match all equal length common prefixes', () => {
    assert.deepEqual({
      kind: Command.ParseResultKind.Success,
      match: {
        kind: Command.MatchKind.Partial,
        potentialValues: ['fart', 'Fartb'],
      },
      consumed: 'Far',
      remaining: 'goo',
    } as Command.ParseSuccess<string>, Command.parseEnum('Fargoo', ['fart', 'Fartb', 'fae']));
  });
  it('should full match unique common prefix', () => {
    assert.deepEqual({
      kind: Command.ParseResultKind.Success,
      match: {
        kind: Command.MatchKind.Full,
        value: 'fart',
      },
      consumed: 'Far',
      remaining: 'goo',
    } as Command.ParseSuccess<string>, Command.parseEnum('Fargoo', ['fart', 'Fam', 'fae']));
  });
});