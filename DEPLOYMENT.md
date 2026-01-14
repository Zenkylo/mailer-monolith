## How to Deploy

There are endless ways to deploy this app. At the end of the day its simply a Nodejs web app supported by Redis and Postgres.  
Anyone who has familiarity deploying these peices of infrastructure can orchestrate these in functional form.  
This document serves to document one such approach.

### Approach

This appraoch uses Docker for supporting services in conjunction with a naked web app opposed to bundeling the web app into Docker.  
I would consider bundling the web app into Docker as the ultimate goal. However, dockerizing the build process in conjunction with spinning this up
in low tier VMs is a massive time sink. For this reason, I have chosen to leave it out. Instead, we will manage the app manually through ssh.
tl;dr - NGINX, Postgres and Redis will be managed through Docker. The web app will be managed manually through ssh-ing into the VM.

### Steps

1. Spin up and VM on any host or cloud provider. So long as you can ssh into it, you can continue. I'd suggess a Linux-based VM.
2. Ssh into VM and clone this repository.
3. Run the `scripts/setup-vm.sh` script. This will install some libraries like zip, git, docker, curl, etc. It also installs Nodejs through nvm.
4. `npm install` dependencies of the project.
5. Update/create the .env file. Use the `node ace generate:key` command to generate an APP_KEY.
6. Run `docker-compose up -d` to initate and run the Docker services. There are 3. NGINX, Redis, and Postgres.
7. Confirm they are running using the command `docker-compose ps`. They should all have the status "Up for {x} minutes (healthy)". If they don't `docker-compose logs` to help toubleshoot issues.
8. Run the migrations with `node ace migration:run`. If there are database connection issues validate the env vars in .env with the variables in docker-compose.
9. Run the app in dev mode. `npm run dev`.
10. You should now be able to access the app through the ip address of your VM.

    TODO: pm2 usage with built app and job worker.
