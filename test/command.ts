import 'mocha';
import { assert } from 'chai';

import * as Command from '../src/Command';

describe('Command.parseWhitespace', () => {
  it('should parse leading whitespace', () => {
    assert.deepEqual(Command.parseWhitespace("   hello "), {
      match: {
        value: '   '
      } as Command.FullMatch<string>,
      consumed: '   ',
      remaining: 'hello ',
    });
  });
  it('should parse newlines', () => {
    assert.deepEqual(Command.parseWhitespace(` 
  hello `), {
        match: {
          value: ` 
  `
        } as Command.FullMatch<string>,
        consumed: ` 
  `,
        remaining: 'hello ',
      });
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
      match: {
        value: 'fart',
      } as Command.FullMatch<string>,
      consumed: 'fart',
      remaining: '   ',
    }, Command.parseToken('fart   ', 'fart'));
  });
  it('should be case insensitive', () => {
    assert.deepEqual({
      match: {
        value: 'fart',
      } as Command.FullMatch<string>,
      consumed: 'FaRt',
      remaining: '   ',
    }, Command.parseToken('FaRt   ', 'fart'));
  });
  it('should partially match', () => {
    assert.deepEqual({
      match: {
        potentialValues: ['fart'],
      } as Command.PartialMatch<string>,
      consumed: 'FaR',
      remaining: '   ',
    }, Command.parseToken('FaR   ', 'fart'));
  });
});

describe('Command.parseInt', () => {
  it('should parse positive numbers', () => {
    assert.deepEqual({
      match: {
        value: 264,
      } as Command.FullMatch<number>,
      consumed: '264',
      remaining: '   ',
    }, Command.parseIntSpec('264   ', null, null));
  });
  it('should parse negative numbers', () => {
    assert.deepEqual({
      match: {
        value: -264,
      } as Command.FullMatch<number>,
      consumed: '-264',
      remaining: '   ',
    }, Command.parseIntSpec('-264   ', null, null));
  });
});