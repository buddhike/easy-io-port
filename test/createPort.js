import sinon from 'sinon';
import Q from 'q';

import createPort from '../lib/createPort';
import refSerializer from '../lib/refSerializer';

describe('io port', function () {
  let port, listener;

  beforeEach(() => {
    port = createPort(refSerializer);
    listener = sinon.spy();
  });

  describe('input', () => {
    it('should be delivered to listeners', () => {
      const inMsg = {type: 'a', body: 'hello'};
      const subscription = port.receive('a', listener);
      port.input(inMsg);
      listener.calledWithMatch(inMsg);
      subscription.unsubscribe();
    });

    it('should ignore when there are no listeners', () => {
      const input = () => port.input({type: 'a', body: 'foo'});
      input.should.not.throw();
    });
  });

  describe('listener', () => {
    let inMsg, subscription;

    beforeEach(() => {
      inMsg = {type: 'a', body: 'hello'};
      subscription = port.receive('a', listener);
    });

    it('should only receive the interested messages', () => {
      const inMsg2 = {type: 'b', body: 'world'};

      port.input(inMsg);
      port.input(inMsg2);

      listener.neverCalledWithMatch(inMsg2).should.be.true;
    });

    it('should not receive messages after unsubscribe', () => {
      subscription.unsubscribe();
      port.input(inMsg);
      listener.neverCalledWithMatch(inMsg).should.be.true;
    });
  });

  describe('output', () => {
    describe('sync void output', () => {
      it('should work', async () => {
        let output = sinon.spy();
        port.bindOutput(output);

        await port.send('a', 'foo');

        output
        .calledWith({type: 'a', body: 'foo'})
        .should
        .be
        .true;
      });
    });

    describe('sync output', () => {
      it('should work', async () => {
        let output = sinon.stub().returns(1);
        port.bindOutput(output);

        await port.send('a', 'foo');

        output
        .calledWith({type: 'a', body: 'foo'})
        .should
        .be
        .true;
      });
    });

    describe('async output', () => {
      it('should await until output is done', async () => {
        const deferred = Q.defer();
        const output = sinon.stub().returns(deferred.promise);
        let completed = false;

        port.bindOutput(output);

        const r = port.send('a', 'foo').then(() => completed = true);

        completed.should.be.false;

        deferred.resolve();
        await r;

        completed.should.be.true;
      });
    });
  });

  describe('sending', () => {

    async function asyncThrow(fn, ...args) {
      try {
        return await fn(...args);
      } catch (e) {
        return e;
      }
    }

    it('should not allow an empty type', async () => {
      const err = await asyncThrow(port.send, '', null);

      err
      .message
      .should
      .equal('type must be a non empty string');
    });

    it('should not allow a null type', async () => {
      const err = await asyncThrow(port.send, null, null);

      err
      .message
      .should
      .equal('type must be a non empty string');
    });

    it('should not allow an undefined type', async () => {
      const err = await asyncThrow(port.send, undefined, null);

      err
      .message
      .should
      .equal('type must be a non empty string');
    });
  });
});
