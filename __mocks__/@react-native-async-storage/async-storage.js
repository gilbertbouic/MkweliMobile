const store = new Map();

module.exports = {
  setItem: jest.fn(async (key, value) => {
    store.set(key, value);
  }),
  getItem: jest.fn(async key => {
    return store.has(key) ? store.get(key) : null;
  }),
  removeItem: jest.fn(async key => {
    store.delete(key);
  }),
  clear: jest.fn(async () => {
    store.clear();
  }),
  getAllKeys: jest.fn(async () => Array.from(store.keys())),
  multiGet: jest.fn(async keys => keys.map(k => [k, store.get(k) ?? null])),
  multiSet: jest.fn(async pairs => {
    for (const [k, v] of pairs) {
      store.set(k, v);
    }
  }),
  multiRemove: jest.fn(async keys => {
    for (const k of keys) {
      store.delete(k);
    }
  }),
  __reset: () => store.clear(),
};
