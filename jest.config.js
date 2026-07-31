export default {
  testEnvironment: "node",
  transform: {},
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  setupFiles: ["<rootDir>/tests/setup/testEnv.js"],
  clearMocks: true,
  verbose: true
};
