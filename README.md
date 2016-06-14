# nodejs-test
Just to test nodejs with mongodb...

# Installation (Ubuntu 14.04)
**node / npm / ts**<br>
`sudo apt-get install nodejs`<br>
`sudo apt-get install npm`<br>
`npm install` (in the directory where package.json is located)<br>
`tsd install`<br>
**mongodb**<br>
`sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927`<br>
`echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list`<br>
`sudo apt-get update`<br>
`sudo apt-get install -y mongodb-org`<br>
**pm2 (only on server)**<br>
`sudo npm install pm2 -g`<br>
`sudo ln -s /usr/bin/nodejs /usr/local/bin/node`<br>
`pm2 start app.js`<br>
`(pm2 startup ubuntu)`<br>

# Run Application
`node app.js`  (in the directory where app.js is located)<br>
The log-output must be: `Node.js (express) server listening on port 9090 in development mode`<br>
