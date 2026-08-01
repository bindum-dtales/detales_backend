import { jest } from "@jest/globals";

export function createChainableQuery(result = { data: null, error: null }) {
  const chain = {};

  const chainable = (impl) =>
    jest.fn((...args) => {
      if (impl) impl(...args);
      return chain;
    });

  chain.select = chainable();
  chain.insert = chainable();
  chain.update = chainable();
  chain.delete = chainable();
  chain.eq = chainable();
  chain.order = chainable();
  chain.single = chainable();
  chain.abortSignal = chainable();

  chain.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  chain.catch = (reject) => Promise.resolve(result).catch(reject);

  return chain;
}

export function createMockSupabaseClient({ queryResult, storageResult, authResult } = {}) {
  const uploadResult = (storageResult && storageResult.upload) || { data: { path: "mock/path" }, error: null };
  const publicUrlResult = (storageResult && storageResult.publicUrl) || {
    data: { publicUrl: "https://mock.local/storage/mock/path" }
  };
  const getUserResult = authResult || {
    data: { user: { id: "mock-user-id", email: "mock-user@dtales.tech" } },
    error: null
  };

  return {
    from: jest.fn(() => createChainableQuery(queryResult ?? { data: null, error: null })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(async () => uploadResult),
        getPublicUrl: jest.fn(() => publicUrlResult)
      }))
    },
    auth: {
      getUser: jest.fn(async () => getUserResult)
    }
  };
}

export default {
  createChainableQuery,
  createMockSupabaseClient
};
