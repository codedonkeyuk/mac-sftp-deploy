# mac-sftp-deploy

This library deploys code to a remote SFTP server based on a information stored within the a mac's keychain, and sftp-deploy.json found within a given target project.

I wrote this because I want to be able to build demos without having to constantly add remove deploy scripts to package.json. I also want my credentials kept as safe as possible on my mac and not sitting in an env file.

This project not only copies files over, it removes orphaned files, and applies permissions.

## Setup

### Add credentials to you keychain

In terminal run the following command, replace password, username etc

```bash
security add-generic-password \
  -s "your-keychain-service-name" \
  -a "your_sftp_username" \
  -j "://yourserver.com" \
  -w "your_secure_password" \
  -U
```

### Add tool to global name space

This is designed to run as a global tool, to do that without deploying to node takes a wee bit of configuration.

Via terminal navigate to the root of this project then...

```bash
  npm install #install libraries
  npm run build #generate js files
  npm link
```

### Add sftp-deploy.json to target project

Navigate to you taget projects directory and create a file named `sftp-deploy.json`.

Add the following content.

```json
{
  "keychainService": "your-mac-key", // keychain key
  "localSource": "./dist", // location of compiled assets
  "remoteDestination": "/my-site" // location on the server, always begins with /
}
```

From within any project you call command below to deploy the code.

```
sftp-deploy
```

### Removal

Via terminal navigate to this project folder

```bash
npm unlink -g
```

## Commands

| code               | description                                                                |
| ------------------ | -------------------------------------------------------------------------- |
| `npm install`      | install dependencies                                                       |
| `nvm use`          | use node version specified in projects .nvmrc file. (NVM needs installing) |
| `npm run test`     | run node:test library                                                      |
| `npm run coverage` | runs node test coverage report                                             |
| `npm run clean`    | clean project using prettier                                               |
| `npm run validate` | validate code using typescript compiler. Does not generate files           |
| `npm run build`    | build ES module using typescript compiler                                  |
