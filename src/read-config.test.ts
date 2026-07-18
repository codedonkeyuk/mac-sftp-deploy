import { describe, it, mock } from "node:test";
import assert from "node:assert";
import path from "node:path";
import fs from "node:fs";
import readConfig from "./read-config.ts";

describe("readConfig Path Resolution Engine", () => {
  it("should parse configuration and convert relative localSource to an absolute path", () => {
    const mockCurrentDir = "/Users/leighgordy/workspace/spa-template";
    const mockConfigPath = path.join(mockCurrentDir, "sftp-deploy.json");

    mock.method(fs, "readFileSync", () => {
      return JSON.stringify({
        localSource: "dist",
        remoteDestination: "/my-site",
      });
    });

    const result = readConfig(mockConfigPath, mockCurrentDir);

    const expectedAbsolutePath = path.resolve(mockCurrentDir, "./dist");

    assert.equal(result.localSource, expectedAbsolutePath);
    assert.equal(result.remoteDestination, "/my-site");

    mock.reset();
  });
});
