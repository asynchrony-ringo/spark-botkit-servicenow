FROM library/node:6.10

RUN apt-get update
RUN apt-get install -y \
  xvfb \
  x11-xkb-utils \
  xfonts-100dpi \
  xfonts-75dpi \
  xfonts-scalable \
  xfonts-cyrillic \
  x11-apps \
  clang \
  libdbus-1-dev \
  libgtk2.0-dev \
  libnotify-dev \
  libgnome-keyring-dev \
  libgconf2-dev \
  libasound2-dev \
  libcap-dev \
  libcups2-dev \
  libxtst-dev \
  libxss1 \
  libnss3-dev \
  gcc-multilib \
  g++-multilib

COPY package.json tmp/package.json
RUN cd tmp \
&& npm install \
&& mkdir /app \
&& cp -R node_modules /app/node_modules/ \
&& rm -R *

COPY . /app

WORKDIR /app

CMD ["node", "src/bot.js"]
