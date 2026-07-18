import { describe, it, mock } from "node:test";
import assert from "node:assert";

mock.module("node:child_process", {
  namedExports: {
    execSync: (command: string) => {
      if (command.includes("test-project-service")) {
        if (command.includes('"acct"<blob>')) return "my-mock-user";
        if (command.includes("-w")) return "my-secret-password";
        if (command.includes('"icmt"<blob>')) return "127.0.0.1";
      }
      throw new Error(`Unexpected command: ${command}`);
    },
  },
});

const { default: fetchCredentials } = await import("./fetch-credentials.ts");

describe("fetchCredentials Engine", () => {
  it("should parse username, password, and host safely out of mocked child process", () => {
    const result = fetchCredentials("test-project-service");

    assert.deepEqual(result, {
      host: "127.0.0.1",
      port: 22,
      username: "my-mock-user",
      password: "my-secret-password",
    });
  });
});
