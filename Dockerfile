
#
# STAGE 1: BUILD
#

FROM node:7.7.2 as builder

# defaults to production, compose overrides this to development on build and run
# ARG NODE_ENV=production
# ENV NODE_ENV $NODE_ENV

# default to port 80 for node, and 5858 or 9229 for debug
# ARG PORT=3000
# ENV PORT $PORT

RUN mkdir -p /opt/app

# install dependencies first, in a different location for easier app bind mounting for local development
WORKDIR /opt
COPY package.json package-lock.json* ./
ENV PATH /opt/node_modules/.bin:$PATH
RUN npm install --quiet && npm cache clean --force

# copy in our source code last, as it changes the most
COPY . /opt/app
WORKDIR /opt/app

RUN npm run build

#
# STAGE 2 PRODUCTION
#

FROM node:alpine

COPY --from=builder /opt/app .

RUN npm install --only=production

USER node

CMD [ "npm", "run", "start:prod" ]
EXPOSE 3000

# if you want to use npm start instead, then use `docker run --init in production`
# so that signals are passed properly. Note the code in index.js is needed to catch Docker signals
# using node here is still more graceful stopping then npm with --init afaik
# I still can't come up with a good production way to run with npm and graceful shutdown

# docker run -it -d --name memegun -v $PWD:/opt/app --network=reverse-proxy overcase-admin