import Rx from 'rxjs';
import ensure from 'easy-ensure';
import aseq from 'easy-aseq';
import _ from 'lodash';

function defineMember(obj, name, impl) {
  ensure.object(obj, 'obj is required');
  ensure.nonEmptyString(name, 'name is required');
  ensure.func(impl, 'impl is required');

  if (obj[name]) {
    throw new Error(`member ${name} already exists`);
  }

  obj[name] = impl;
  return obj;
}

export default () => {
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

    const message = JSON.stringify({
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
    ensure.string(input, 'input must be a string');
    const parsed = JSON.parse(input);
    _.each(listeners, l => l.next(parsed));
  });

  return observable;
}
