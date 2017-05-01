const hmacSha1Calculator = require('../../../src/components/routeControllers/hmac_sha1_calculator.js');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('hmac sha1 calculator', () => {
  describe('addToRequest', () => {
    let req;
    let res;
    let buff;
    let encoding;

    beforeEach(() => {
      process.env.secret = 'super awesome secret';
      req = {};
      res = {};
      buff = { toString: sinon.stub() };
      encoding = 'encoding';
    });

    afterEach(() => {
      delete process.env.secret;
    });

    it('should not set req.hmacSHA1 if no process.env.secret', () => {
      delete process.env.secret;

      hmacSha1Calculator.addToRequest(req, res, buff, encoding);
      expect(req).to.deep.equal({});
    });

    it('should set req.hmacSHA1 if process.env.secret is set', () => {
      buff.toString.withArgs(encoding).returns('buffer');
      hmacSha1Calculator.addToRequest(req, res, buff, encoding);
      expect(req).to.deep.equal({ hmacSHA1: '448f407b97cb003f9ab46b7610fbc6b35abcf149' });
    });
  });
});
