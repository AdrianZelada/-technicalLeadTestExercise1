FROM node:14

ADD . /trips

# Install dependencies
RUN cd /trips; \
    npm install;

# Expose our server port.
EXPOSE 5000

# Run our app.
CMD ["ls"]
CMD ["node", "/trips/index.js"]