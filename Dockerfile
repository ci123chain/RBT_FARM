From node:10.14.0

WORKDIR /opt/deploy-app
COPY . /opt/deploy-app/

RUN npm i -g web3 \
&& npm i -g truffle@5.4.7 \
&& npm i \

CMD npm run deploy-ci123