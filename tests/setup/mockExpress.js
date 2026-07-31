import { jest } from "@jest/globals";

export function createMockReq(overrides = {}) {
  return {
    headers: {},
    params: {},
    body: {},
    query: {},
    originalUrl: "/test",
    method: "GET",
    ...overrides
  };
}

export function createMockRes() {
  const res = {};

  res.statusCode = null;
  res.headers = {};
  res.body = undefined;
  res.headersSent = false;

  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });

  res.json = jest.fn((payload) => {
    res.body = payload;
    return res;
  });

  res.send = jest.fn((payload) => {
    res.body = payload;
    return res;
  });

  res.setHeader = jest.fn((key, value) => {
    res.headers[key] = value;
  });

  res.header = res.setHeader;

  res.sendStatus = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });

  res.on = jest.fn();
  res.removeHeader = jest.fn((key) => {
    delete res.headers[key];
  });

  return res;
}

export function createMockNext() {
  return jest.fn();
}

export default {
  createMockReq,
  createMockRes,
  createMockNext
};
