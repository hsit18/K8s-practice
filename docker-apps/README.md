# docker practice

# Apps
* golang: multi step build with scratch image
* node app: simple node 14 apline image 
* node app: multi step build with nginx image

# docker commands

### docker build for image building
docker build -t <USERNAME>/<NAME>:<VERSION> .
docker build -t hsit18/golangapp:v1 .

### docker run for running container from image created
docker run -p <OUTSIDE_PORT>:<INNER_PORT> -name <CONTAINER_NAME> <FULL_IMAGENAME> 
FULL_IMAGENAME should be at last

### remove all stopped containers
docker container prune

### remove all unused images by containers
docker image prune -a

### container logs in watch mode
docker logs -f <CONTAINER_ID>

### inspect container informations
docker inspect 


# docker volumes
## 3 types 
1. Anonymous volume:
        Managed by docker and created with container start. 
        In DockerFile define command as:  VOLUME [ "/<WORKING_DIR>/<FOLDER_NAME>" ]
        Here we dont know the mapped folder location on host machine and name also random text.

2. Named volume: 
        docker run -v <VOL_NAME>:<CONTAINER_FOLDER_PATH>. 
        To remove by docker rm <VOL_NAME> OR docker volume prune
        Here we dont know the mapped folder location on host machine
        

3. Binding volume: 
        Here we know the mapped folder location on host machine

### docker vloumes commands
docker volume ls

docker volume prune