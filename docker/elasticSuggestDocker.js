/* @flow */

const cp = require('child_process');
const path = require('path');

const dockerImageName = 'elasticsearch-nodkz:5';
const containerName = `elasticsearch-nodkz-container`;

function isDockerImageExists(imageNameWithTag) {
  const imageId = cp.execSync(`docker images -q ${imageNameWithTag}`, { cwd: '.' }).toString();
  return imageId && imageId.length > 0;
}

function buildDockerContainer() {
  const dockerContextFolder = path.resolve(__dirname, `./es5`);
  cp.execSync(
    `docker build \
    -t ${dockerImageName} \
    ${dockerContextFolder}`,
    {
      cwd: dockerContextFolder,
      stdio: [0, 1, 2],
    }
  );
}

export function runDockerContainer() {
  if (!isDockerImageExists(dockerImageName)) {
    buildDockerContainer();
  }

  cp.execSync(`docker run --rm -d -p 9200:9200 --name ${containerName} ${dockerImageName}`, {
    stdio: [0, 1, 2],
  });
}

export function stopDockerContainer() {
  cp.execSync(`docker stop ${containerName}`, { stdio: [0, 1, 2] });
  // cp.execSync(`docker rmi -f ${dockerImageName}`, { stdio: [0, 1, 2] });
  // cp.execSync(`docker rmi -f elasticsearch:5-alpine`, { stdio: [0, 1, 2] });
  process.exit(0);
}

process.on('SIGINT', stopDockerContainer); // catch ctrl-c
process.on('SIGTERM', stopDockerContainer); // catch kill
