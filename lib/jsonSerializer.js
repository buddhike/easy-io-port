import ensure from 'easy-ensure';

export default {
  serialize: value => {
    ensure(value, 'value is required');
    return JSON.stringify(value);
  },
  deserialize: value => {
    ensure.string(value, 'value must be a valid string');
    return JSON.parse(value);
  }
}
