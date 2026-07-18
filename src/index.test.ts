import { describe, it, mock } from "node:test";
import assert from "node:assert";
import fs from "node:fs";

const indexTestState = {
  sftpClientPayload: null as any,
};

mock.module("./read-config.ts", {
  exports: {
    default: () => ({
      keychainService: "test-project-service",
      localSource: "/Users/leighgordy/workspace/spa-template/dist",
      remoteDestination: "/html",
    }),
  },
});

mock.module("./fetch-credentials.ts", {
  exports: {
    default: (service: string) => {
      if (service !== "test-project-service")
        throw new Error("Unexpected service");
      return {
        host: "127.0.0.1",
        port: 22,
        username: "my-mock-user",
        password: "my-secret-password",
      };
    },
  },
});

mock.module("./sftp-client.ts", {
  exports: {
    default: async (payload: any) => {
      indexTestState.sftpClientPayload = payload;
    },
  },
});

mock.method(fs, "existsSync", () => true);

await import("./index.ts");

describe("Master Index Orchestration Engine", () => {
  it("should correctly wire config parsing, keychain fetching, and client arguments together", () => {
    assert.deepEqual(indexTestState.sftpClientPayload, {
      credentials: {
        host: "127.0.0.1",
        port: 22,
        username: "my-mock-user",
        password: "my-secret-password",
      },
      localSource: "/Users/leighgordy/workspace/spa-template/dist",
      remoteDestination: "/html",
    });
  });
});
