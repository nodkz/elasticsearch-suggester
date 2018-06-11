/* @flow */

const cp = require('child_process');
const path = require('path');

const dockerImageName = 'es:5';
const containerName = `es-container`;

function isDockerImageExists(imageName) {
  const imageId = cp.execSync(`docker images -q ${imageName}`, { cwd: '.' }).toString();
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
  console.log('inside run');
  const runningContainer = cp
    .execSync(`docker ps -f "name=${containerName}" --format "{{.Names}}"`)
    .toString();
  if (!runningContainer) {
    if (!isDockerImageExists(dockerImageName)) {
      buildDockerContainer();
    }
    const aliveContainer = cp
      .execSync(`docker run --rm -d -p 9200:9200 --name ${containerName} ${dockerImageName}`)
      .toString();
    return aliveContainer;
  }
  return runningContainer;
}

export function stopAndRemoveDockerContainer() {
  console.log('inside exit');
  const stoppedContainer = cp.execSync(`docker stop ${containerName}`).toString();
  if (!stoppedContainer) throw new Error(`Can't stop '${stoppedContainer}' container`);
  return stoppedContainer;
  // cp.execSync(`docker rm ${containerName}`);
  // if (isContainerRunning()) reject(new Error(`Can't stop and remove container`));
  // resolve(true);
  // cp.execSync(`docker rmi -f ${dockerImageName}`, { stdio: [0, 1, 2] });
  // cp.execSync(`docker rmi -f elasticsearch:5-alpine`, { stdio: [0, 1, 2] });
}
