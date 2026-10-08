/* eslint-env jest */
/**
 * Unit tests must never hit the network. Node's built-in fetch is otherwise
 * used by the App's auto-update on mount, which starts real downloads to the
 * sanctions list hosts with long timeouts and keeps Jest workers alive after
 * the tests finish ("A worker process has failed to exit gracefully").
 */
global.fetch = jest.fn(() =>
  Promise.reject(new Error('Network access is disabled in unit tests')),
);
