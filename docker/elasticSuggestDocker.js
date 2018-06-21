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

function isContainerRunning() {
  const isRunning = cp
    .execSync(`docker ps -f "name=${containerName}" --format "{{.Names}}"`)
    .toString();
  return !!isRunning;
}

export function runDockerContainer() {
  console.log('inside run');
  if (!isContainerRunning()) {
    if (!isDockerImageExists(dockerImageName)) buildDockerContainer();
    cp.execSync(`sh es.sh ${containerName} ${dockerImageName}`, {
      cwd: path.resolve(__dirname, `./es5`),
      stdio: [0, 1, 2],
    });
    return true;
  }
  return true;
}

export function stopDockerContainer() {
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
