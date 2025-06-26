#!/bin/bash

# sudo docker build -t analytics .
# sudo docker build -t waeez/analytics:backend_agents .
# sudo docker build --platform linux/arm64 -t sai8151/backend:cap_backend .
# sudo docker run -d --name analytics_con -p 80:80 -v /home/ubuntu/deepsearch-server/logs:/code/logs --network="host" analytics 
sudo docker build -t sai8151/backend:wework_backend .
sudo docker run -d --name analytics_con -p 81:81 -v /home/ubuntu/deepsearch-server/logs:/code/logs --network="host" sai8151/backend:wework_backend 

sudo docker system prune -f

sudo docker ps -a