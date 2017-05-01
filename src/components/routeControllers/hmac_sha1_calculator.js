const hmacSHA1 = require('crypto-js/hmac-sha1');

const hmacSha1Calculator = {
  addToRequest: (req, res, buff, encoding) => {
    if (process.env.secret) {
      req.hmacSHA1 = hmacSHA1(buff.toString(encoding), process.env.secret).toString();
    }
  },
};

module.exports = hmacSha1Calculator;
