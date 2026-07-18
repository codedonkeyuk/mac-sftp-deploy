import fs from "node:fs";
import path from "node:path";

const readConfig = (
  configPath: string,
  currentDirectory: string,
): {
  localSource: string;
  remoteDestination: string;
  keychainService: string;
} => {
  try {
    const rawData = fs.readFileSync(configPath, "utf8");
    const fileConfig = JSON.parse(rawData);
    const localSource = path.resolve(currentDirectory, fileConfig.localSource);

    if (!fileConfig.remoteDestination.startsWith("/")) {
      console.error(
        `👉 You provided: "${fileConfig.remoteDestination}", paths must be absolute and begin with a leading forward slash (e.g., \"/my-site\").\n`,
      );
      process.exit(1);
    }

    console.log("✅ Project paths identified.");
    return {
      localSource,
      remoteDestination: fileConfig.remoteDestination,
      keychainService: fileConfig.keychainService,
    };
  } catch (error) {
    console.error(
      "❌ Failed to parse sftp-deploy.json. Verify your file structure.",
    );
    process.exit(1);
  }
};

export default readConfig;
