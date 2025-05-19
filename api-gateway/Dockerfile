FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm install -g nodemon
EXPOSE 5000
CMD ["npm", "run", "dev"]

