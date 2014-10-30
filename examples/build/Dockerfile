FROM ubuntu

RUN \
  apt-get update && \
  apt-get install -y wget xfonts-base xfonts-100dpi xfonts-75dpi xfonts-cyrillic xfonts-mathml && \
  wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
  echo "deb http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
  apt-get update && \
  apt-get install -y google-chrome-stable xvfb

CMD ["bash"]
