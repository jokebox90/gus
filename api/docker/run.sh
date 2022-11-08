#!/bin/bash -eu

dockerize -wait tcp://db:3306 -timeout 60s
dockerize -wait tcp://${MINIO_ENDPOINT} -timeout 60s

mc alias set gus http://${MINIO_ENDPOINT} ${MINIO_ACCESS_KEY} ${MINIO_SECRET_KEY}

alembic -c development.ini revision --autogenerate -m "dockerize"
alembic -c development.ini upgrade head

exec pserve development.ini --reload