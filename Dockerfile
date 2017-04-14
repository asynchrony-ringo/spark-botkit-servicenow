FROM library/node:6.10

COPY package.json tmp/package.json
RUN cd tmp \
&& npm install \
&& mkdir /app \
&& cp -R node_modules /app/node_modules/ \
&& rm -R *

COPY . /app

WORKDIR /app

CMD ["node", "src/bot.js"]
