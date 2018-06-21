#!/bin/bash

ES_CONTAINER_EXTERNAL_PORT=$1
ES_CONTAINER_NAME=$2
ES_DOCKER_IMAGE_NAME=$3
URL="http://127.0.0.1:$ES_CONTAINER_EXTERNAL_PORT"

#  OS="`uname`"
# if [ $OS = "Linux" ]; then
#    sysctl -q -w vm.max_map_count=262144
# fi

isElasticAvailable() {
  curl -s $URL 2>&1 > /dev/null
  if [ $? != 0 ]; then
    false
  else
    true
  fi
}

echo 'cp pid: ' $$
docker run --rm -d -p $ES_CONTAINER_EXTERNAL_PORT:9200 --name $ES_CONTAINER_NAME $ES_DOCKER_IMAGE_NAME

until isElasticAvailable
  do
      echo 'waiting for ElasticSearch container...'
      sleep 3.0
  done
    echo 'ElasticSearch up!'
    exit 0
