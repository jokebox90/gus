FROM python:3.10-bullseye

# - Stockage de fichiers
#   de l'application
WORKDIR /webapp
COPY ./ /webapp/

# - Outil de test d'intégrité et
#   de connectivité du conteneur
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

RUN curl https://dl.min.io/client/mc/release/linux-amd64/mc \
        --create-dirs \
        -o /webapp/minio-binaries/mc \
    && chmod +x /webapp/minio-binaries/mc

ENV PATH /webapp/minio-binaries:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# - Instalation des bibliothèques
#   pour Python
RUN pip install -U pip setuptools
RUN pip install -e ".[testing]"

# - Nettyage des fichiers liés
#   à l'environnement
RUN find gallery_by_jokebox90/alembic/versions -type f -name '*.py*' -exec rm -f '{}' \;

# - Port ouvert pour la connexion
#   au serveur
EXPOSE 6543

# - Port ouvert pour le debogage
#   à distance de l'application
EXPOSE 5678

# - Script d'initialisation de
#   l'environnement de l'application
COPY ./docker/entrypoint.sh /usr/libexec/docker/entrypoint
RUN chmod +x /usr/libexec/docker/entrypoint

# - Commande de démarrage de
#   l'application et de mise
#   à disposition des services
COPY ./docker/run.sh /usr/libexec/docker/run
RUN chmod +x /usr/libexec/docker/run
CMD [ "/usr/libexec/docker/run" ]