import { emitNew, onNew } from '@/lib/appEvents.js';

describe('appEvents', () => {
  it('notifies subscribers when emitNew is called', () => {
    const callback = jest.fn();
    const unsubscribe = onNew(callback);
    emitNew();
    expect(callback).toHaveBeenCalledTimes(1);
    unsubscribe();
    emitNew();
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
