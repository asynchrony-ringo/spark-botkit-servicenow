#!/bin/bash

echo 'Starting ngrok'
ngrok http 3000 -log=stdout > /dev/null &
until URL=`curl -s localhost:4040/api/tunnels | grep -o 'https:[^"]*.ngrok.io'`
do
  echo 'Waiting for ngrok...'
  sleep 1s
done
echo "ngrok running at $URL"

echo 'Updating .env'
sed -i.bak -e "s|public_address=.*|public_address=$URL|" .env

echo 'Building Docker image'
IMAGE=asynchronyringo/service-now-spark-bot
docker build -t $IMAGE .

echo 'Stopping/starting docker container'
docker-compose down
docker-compose up -d

until curl -Is $URL | grep '200 OK'
do
  echo 'Waiting for bot'
  sleep 1s
done

CONTAINER=`docker ps -f ancestor=$IMAGE -lq`
echo "Docker container: $CONTAINER"

n=0
until [ $n -ge 3 ]
do
  docker exec -e DEBUG=nightmare:actions* $CONTAINER xvfb-run npm run uat
  EXIT=$?
  if [ $EXIT -eq 0 ]
  then
    break
  fi
  n=$(($n + 1))
done

echo 'Shutting down docker'
docker-compose down

echo 'Killing ngrok'
kill `ps -ef | grep 'ngrok' | grep -v 'grep' | awk '{print $2}'`

exit $EXIT
