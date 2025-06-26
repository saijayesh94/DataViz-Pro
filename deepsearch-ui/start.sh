#!/bin/bash

sudo docker build -t sai8151/frontend:wework_frontend .

# sudo docker build --no-cache --platform linux/arm64 -t sai8151/frontend:cap .
# sudo docker build --no-cache --platform linux/arm64 -t waeez/analytics:frontend_agents .
sudo docker run -d --name frontend_con -p 82:80 sai8151/frontend:wework_frontend
# sudo docker run -d --name frontend_con -p 82:80 waeez/analytics:frontend_agents
sudo docker system prune -f

