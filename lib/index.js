import createPort from './createPort';
import refSerializer from './refSerializer';
import jsonSerializer from './jsonSerializer';

export default {
  forNetwork: () => createPort(jsonSerializer),
  forInProc: () => {
    const port = createPort(refSerializer)
    port.bindOutput(m => port.input(m));
    return port;
  }
}
