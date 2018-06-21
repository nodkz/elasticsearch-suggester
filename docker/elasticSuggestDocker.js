/* @flow */

const cp = require('child_process');
const path = require('path');

const dockerImageName = 'es:5';
const containerNamePrefix = `es-container`;

function generateContainerName() {
  return `${containerNamePrefix}-${Date.now()}`;
}

function generateAvailablePort() {
  const port = Math.floor(Math.random() * (9900 - 9200)) + 9200;
  // let notAvailable = cp.execSync(`lsof -i:${port}`).toString();
  // while (notAvailable) {
  //   port += 1;
  //   notAvailable = cp.execSync(`lsof -i:${port}`).toString();
  // }
  return port;
}

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

// function isContainerRunning(containerName) {
//   const isRunning = cp
//     .execSync(`docker ps -f "name=${containerName}" --format "{{.Names}}"`)
//     .toString();
//   return !!isRunning;
// }

export function runDockerContainer() {
  const containerName = generateContainerName();
  const port = generateAvailablePort();
  if (!isDockerImageExists(dockerImageName)) buildDockerContainer();
  cp.execSync(`sh es.sh ${port} ${containerName} ${dockerImageName} & wait`, {
    cwd: path.resolve(__dirname, `./es5`),
    stdio: [0, 1, 2],
  });
  return { containerName, port };
}

export function stopDockerContainer(containerName) {
  const stoppedContainer = cp.execSync(`docker stop ${containerName}`).toString();
  if (!stoppedContainer) throw new Error(`Can't stop '${stoppedContainer}' container`);
  return true;
  // cp.execSync(`docker rmi -f ${dockerImageName}`, { stdio: [0, 1, 2] });
  // cp.execSync(`docker rmi -f elasticsearch:5-alpine`, { stdio: [0, 1, 2] });
}
