import Rx from 'rxjs';
import ensure from 'easy-ensure';
import aseq from 'easy-aseq';
import _ from 'lodash';

import defineMember from './defineMember';

export default (serializer) => {
  ensure.object(serializer, 'serializer is required');

  const listeners = [];
  const outputs = [];

  const observable = Rx.Observable.create(listener => {
    listeners.push(listener);
    return () => {
      _.pull(listeners, listener);
    }
  });

  defineMember(observable, 'receive', (type, callback) => {
    ensure.nonEmptyString(type, 'type must be a non empty string');
    ensure.func(callback, 'callback must be a function');

    return observable.filter(m => m.type === type).subscribe(callback);
  });

  defineMember(observable, 'send', async (type, body) => {
    ensure.nonEmptyString(type, 'type must be a non empty string');

    const message = serializer.serialize({
      type: type,
      body: body
    });

    await aseq.each(outputs, async o => {
      const r = o(message);
      if (r && r.then) {
        await r;
      }
    });
  });

  defineMember(observable, 'bindOutput', (output) => {
    ensure.func(output, 'output must be a function');
    outputs.push(output);
  });

  defineMember(observable, 'input', (input) => {
    ensure(input, 'input is required');
    const parsed = serializer.deserialize(input);
    _.each(listeners, l => l.next(parsed));
  });

  return observable;
}
