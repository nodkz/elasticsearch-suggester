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
  const isRunning = cp.execSync(`docker ps -f "name=${containerName}"`, {
    stdio: [0, 1, 2],
  });
  return !!isRunning;
}

export function runDockerContainer() {
  // if (isContainerRunning()) {
  //   cp.execSync(`docker stop ${containerName}`, {
  //     stdio: [0, 1, 2],
  //   });
  // }
  if (!isDockerImageExists(dockerImageName)) {
    buildDockerContainer();
  }
  cp.execSync(`docker run --rm -d -p 9200:9200 --name ${containerName} ${dockerImageName}`, {
    stdio: [0, 1, 2],
  });
}

export function stopAndRemoveDockerContainer() {
  console.log('akslskjdmslkdmclsdmcsdcmsdcmlksdmclksmdlcksmdlkcmsdlkkkmklmclsmdklsmcklsmd');
  cp.execSync(`docker stop ${containerName}`, { stdio: [0, 1, 2] });
  cp.execSync(`docker rm ${containerName}`, { stdio: [0, 1, 2] });
  // cp.execSync(`docker rmi -f ${dockerImageName}`, { stdio: [0, 1, 2] });
  // cp.execSync(`docker rmi -f elasticsearch:5-alpine`, { stdio: [0, 1, 2] });
  process.exit(0);
}
