#!/bin/bash

CONT_NAME=analytics_con

sudo docker stop $CONT_NAME

sudo docker rm $CONT_NAME

sudo docker build -t analytics .

sudo docker run --interactive --tty --name $CONT_NAME -p 80:80 -v /home/ubuntu/deepsearch-server/logs:/code/logs --entrypoint /bin/sh analytics -c "uvicorn process_main:app --host 0.0.0.0 --port 80"
