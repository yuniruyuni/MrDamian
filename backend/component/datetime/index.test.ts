import dayjs from 'dayjs';
import { describe, it, expect } from 'bun:test';
import { Datetime, type DatetimeConfig } from './index';
import { eventChannel, NamedEventEmitter } from '~/backend/model/events';

describe('Datetime', () => {
  it('should return current datetime', async () => {
    const [emitter] = eventChannel();
    const named = new NamedEventEmitter(emitter, ['datetime']);
    const datetime = new Datetime(named);
    const actual = await datetime.run({
      args: { format: 'YYYY-MM-DD' },
    } as DatetimeConfig);
    expect(actual).toEqual(dayjs().format('YYYY-MM-DD'));
  });
});
