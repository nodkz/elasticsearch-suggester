#!/bin/bash

ES_CONTAINER_NAME=$1
ES_DOCKER_IMAGE_NAME=$2

docker run --rm -d -p 9200:9200 --name $ES_CONTAINER_NAME $ES_DOCKER_IMAGE_NAME
res=$(curl -sk http://localhost:9200/_cat/health)
# Wait for the elastic port to be available
until `$(curl localhost:9200/_cluster/health)`
do
    echo "$status_code"
    # echo "waiting for elastic container..."
    sleep 3.0
done
