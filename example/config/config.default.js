const path = require('path');

// setting which middleware need use
exports.middleware = ['robot', 'staticCache'];

// setting robot options
exports.robot = {
  ua: [
    /robotspider/i,
  ],
};

// setting staticCache options
exports.staticCache = {
  dir: path.join(__dirname, './../static'),
};
