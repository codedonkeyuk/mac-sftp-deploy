import { describe, it, mock, beforeEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import SftpClient from "ssh2-sftp-client";
import sftpClient from "./sftp-client.ts";

const mockState = {
  connectCalledWith: null as any,
  uploadDirCalledWith: [] as any[],
  endCalledTimes: 0,
};

describe("sftpClient Localhost Safety Test", () => {
  beforeEach(() => {
    mockState.connectCalledWith = null;
    mockState.uploadDirCalledWith = [];
    mockState.endCalledTimes = 0;

    mock.method(fs, "existsSync", () => true);

    mock.method(SftpClient.prototype, "connect", async (config: any) => {
      mockState.connectCalledWith = config;
      return "connected";
    });

    mock.method(
      SftpClient.prototype,
      "uploadDir",
      async (src: string, dest: string) => {
        mockState.uploadDirCalledWith = [src, dest];
        return "uploaded";
      },
    );

    mock.method(SftpClient.prototype, "list", async () => []);

    mock.method(SftpClient.prototype, "end", async () => {
      mockState.endCalledTimes++;
    });
  });

  it("should execute lifecycle locally without hitting external networks", async () => {
    const payload = {
      credentials: {
        host: "127.0.0.1",
        port: 2222,
        username: "local-test-user",
        password: "local-test-password",
      },
      localSource: "/dist",
      remoteDestination: "/html",
    };

    await sftpClient(payload);

    assert.deepEqual(mockState.connectCalledWith, payload.credentials);
    assert.equal(mockState.uploadDirCalledWith[0], "/dist");
    assert.equal(mockState.uploadDirCalledWith[1], "/html");
    assert.equal(mockState.endCalledTimes, 1);
  });
});
