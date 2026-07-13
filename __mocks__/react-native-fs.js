const fs = new Map();

module.exports = {
  CachesDirectoryPath: '/tmp/mkweli-cache',
  DocumentDirectoryPath: '/tmp/mkweli-docs',
  exists: jest.fn(async path => fs.has(path)),
  unlink: jest.fn(async path => {
    fs.delete(path);
  }),
  mkdir: jest.fn(async () => undefined),
  stat: jest.fn(async path => ({size: (fs.get(path) || '').length})),
  readFile: jest.fn(async path => {
    if (!fs.has(path)) {
      throw new Error('ENOENT');
    }
    return fs.get(path);
  }),
  writeFile: jest.fn(async (path, content) => {
    fs.set(path, content);
  }),
  moveFile: jest.fn(async (from, to) => {
    if (fs.has(from)) {
      fs.set(to, fs.get(from));
      fs.delete(from);
    }
  }),
  read: jest.fn(async (path, length, position) => {
    const data = fs.get(path) || '';
    return data.slice(position, position + length);
  }),
  downloadFile: jest.fn(() => ({
    promise: Promise.resolve({statusCode: 200, bytesWritten: 0, jobId: 1}),
  })),
  stopDownload: jest.fn(),
  __fs: fs,
  __reset: () => fs.clear(),
};
