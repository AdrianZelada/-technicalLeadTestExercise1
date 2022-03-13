//  config.js
//
//  Simple application configuration. Extend as needed.
module.exports = {
	port: process.env.PORT || 5000,
  db: {
    host: 'mongodb://localhost:27017/trips',
    // database: 'mean2',
    database: 'trips',
    user: 'myUserAdmin',
    password: 'EijCmiRaXRkAtxHs',
    port: 3306
  },
    email:{
        'service':'Gmail',
        'userEmail':'xxxx@gmail.com',
        'userPass':'send.xxxxx',
        host:'localhost',
    },
    'ports' : {
        'http' : 3000
    },

  rabbit:{
	host: 'amqp://localhost'
  }
};
// mongodb://localhost:27017/trips?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false
