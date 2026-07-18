import { execSync } from "node:child_process";

const fetchCredentials = (
  keychainService: string,
): {
  host: string;
  port: number;
  username: string;
  password: string;
} => {
  try {
    const username = execSync(
      `security find-generic-password -s "${keychainService}" | grep '"acct"<blob>' | cut -d'"' -f4`,
      { encoding: "utf8" },
    ).trim();

    const password = execSync(
      `security find-generic-password -s "${keychainService}" -w`,
      { encoding: "utf8" },
    ).trim();

    const host = execSync(
      `security find-generic-password -s "${keychainService}" | grep '"icmt"<blob>' | cut -d'"' -f4`,
      { encoding: "utf8" },
    ).trim();

    return {
      host,
      port: 22,
      username,
      password,
    };
  } catch (error) {
    console.error(
      `❌ Error: Could not retrieve secure profile "${keychainService}" from macOS Keychain.`,
    );
    process.exit(1);
  }
};

export default fetchCredentials;
