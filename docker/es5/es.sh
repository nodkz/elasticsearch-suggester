#!/bin/bash

ES_CONTAINER_NAME=$1
ES_DOCKER_IMAGE_NAME=$2

#  OS="`uname`"
# if [ $OS = "Linux" ]; then
#    sysctl -q -w vm.max_map_count=262144
# fi

isElasticAvailable() {
  curl -s http://localhost:9200 2>&1 > /dev/null
  if [ $? != 0 ]; then
    false
  else
    true
  fi
}

docker run --rm -d -p 9200:9200 --name $ES_CONTAINER_NAME $ES_DOCKER_IMAGE_NAME

until isElasticAvailable
  do
      echo 'waiting for ElasticSearch container...'
      sleep 3.0
  done
    echo 'ElasticSearch up!'
    exit 0
