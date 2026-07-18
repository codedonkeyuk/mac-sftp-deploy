#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import readConfig from "./read-config.ts";
import fetchCredentials from "./fetch-credentials.ts";
import sftpClient from "./sftp-client.ts";

console.log("🔍 Looking for project sftp-deploy.json...");

const currentDirectory = process.cwd();
const configPath = path.join(currentDirectory, "sftp-deploy.json");

if (!fs.existsSync(configPath)) {
  console.error("❌ Error: sftp-deploy.json not found in this directory.");
  process.exit(1);
}

const { keychainService, localSource, remoteDestination } = readConfig(
  configPath,
  currentDirectory,
);

console.log("🔍 Fetching deployment credentials from macOS Keychain...");
const credentials = fetchCredentials(keychainService);

await sftpClient({
  credentials,
  localSource,
  remoteDestination,
});
