FROM node:12

RUN mkdir -p /src
COPY . /src

EXPOSE 30000:30000

WORKDIR /src
CMD tail -f /dev/null
