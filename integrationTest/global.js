const env = require('node-env-file');

before(() => {
  env('.env');
});
