# nodejs-test
Just to test nodejs...

# Installation
**node / npm / ts**<br>
`npm install`<br>
`tsd install`<br>
**mongodb (Ubuntu)**<br>
`sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927`<br>
`echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list`<br>
`sudo apt-get update`<br>
`sudo apt-get install -y mongodb-org`<br>
**pm2 (Ubuntu)**<br>
`sudo npm install pm2 -g`
`sudo ln -s /usr/bin/nodejs /usr/local/bin/node`
`pm2 start app.js`
`(pm2 startup ubuntu)`