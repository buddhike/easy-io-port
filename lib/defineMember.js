import ensure from 'easy-ensure';

export default (obj, name, impl) => {
  ensure.object(obj, 'obj is required');
  ensure.nonEmptyString(name, 'name is required');
  ensure.func(impl, 'impl is required');

  if (obj[name]) {
    throw new Error(`member ${name} already exists`);
  }

  obj[name] = impl;
  return obj;
}
