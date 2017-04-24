import 'mocha';
import { assert } from 'chai';

import * as Command from '../src/Command';

describe('command parser', () => {
  it('should exist', () => {
    assert.isNotNull(Command.parse);
  });
});
