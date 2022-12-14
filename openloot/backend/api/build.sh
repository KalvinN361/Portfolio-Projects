docker build . -t us-south1-docker.pkg.dev/bigtime-socials/openloot/openlootambassadorapi/api:latest
docker push us-south1-docker.pkg.dev/bigtime-socials/openloot/openlootambassadorapi/api:latest


docker build . -t us-south1-docker.pkg.dev/bigtime-socials/openloot/openlootambassadorserver/server:latest
docker push us-south1-docker.pkg.dev/bigtime-socials/openloot/openlootambassadorserver/server:latest