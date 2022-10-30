FROM python:3.10-bullseye

WORKDIR /webapp
COPY ./requirements.txt /webapp/requirements.txt
RUN pip install -r requirements.txt
RUN pip install gunicorn

EXPOSE 6543
CMD [ "gunicorn", "--reload", "--workers=1", "--bind", ":6543", "wsgi:app" ]
