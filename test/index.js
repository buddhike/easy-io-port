import sinon from 'sinon';
import ioPort from '../lib/index';

describe('inproc io port', () => {
  let port, receiver;

  beforeEach(() => {
    port = ioPort.forInProc()
    receiver = sinon.spy();
  });

  it('deliver the same reference to subscribers', () => {
    const msg = {};
    port.receive('a', receiver);

    port.send('a', msg);

    const arg = receiver.getCall(0).args[0];
    arg.body.should.equal(msg);
  });
});
