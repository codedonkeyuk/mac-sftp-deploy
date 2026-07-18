import SftpClient from "ssh2-sftp-client";
import path from "node:path";
import fs from "node:fs";

interface DeployPayload {
  credentials: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
  localSource: string;
  remoteDestination: string;
}

const sftpClient = async ({
  credentials,
  localSource,
  remoteDestination,
}: DeployPayload) => {
  const sftp = new SftpClient();

  try {
    console.log("🔄 Connecting to remote server via secure SFTP...");
    await sftp.connect(credentials);
    console.log("✅ Connection established.");

    if ((sftp as any).client) {
      (sftp as any).client.setMaxListeners(0);
    }

    console.log(
      `📤 Uploading files from ${localSource} to ${remoteDestination}...`,
    );

    await sftp.uploadDir(localSource, remoteDestination, {
      filter: (localPath) =>
        !localPath.includes(".git") && !localPath.includes(".DS_Store"),
    });

    console.log("🧹 Pruning old files from the remote server...");
    await pruneRemoteFolder(sftp, localSource, remoteDestination);

    console.log("🔒 Securing uploaded files and subfolders...");
    await fixRemotePermissions(sftp, remoteDestination);

    console.log("🚀 Deployment successfully completed!");
  } catch (err: any) {
    console.error("❌ Deployment failure:", err?.message || String(err));
  } finally {
    await sftp.end();
  }
};

async function pruneRemoteFolder(
  sftp: SftpClient,
  localDir: string,
  remoteDir: string,
) {
  const remoteItems = await sftp.list(remoteDir);

  for (const item of remoteItems) {
    const localPath = path.join(localDir, item.name);
    const remotePath = `${remoteDir}/${item.name}`;

    if (!fs.existsSync(localPath)) {
      if (item.type === "d") {
        console.log(`🗑️ Removing old remote directory: ${remotePath}`);
        await sftp.rmdir(remotePath, true);
      } else {
        console.log(`🗑️ Deleting old remote file: ${remotePath}`);
        await sftp.delete(remotePath);
      }
    } else if (item.type === "d") {
      await pruneRemoteFolder(sftp, localPath, remotePath);
    }
  }
}

async function fixRemotePermissions(sftp: SftpClient, remoteDir: string) {
  const items = await sftp.list(remoteDir);

  for (const item of items) {
    const fullRemotePath = `${remoteDir}/${item.name}`;

    if (item.type === "d") {
      await sftp.chmod(fullRemotePath, 0o755);
      await fixRemotePermissions(sftp, fullRemotePath);
    } else {
      await sftp.chmod(fullRemotePath, 0o644);
    }
  }
}

export default sftpClient;
