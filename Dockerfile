From node:10.14.0

WORKDIR /opt/deploy-app
COPY . /opt/deploy-app/

RUN npm i -g cnpm \
&& cnpm i -g truffle@5.4.7 \
&& cnpm i

CMD npm run script:deploy-ci123