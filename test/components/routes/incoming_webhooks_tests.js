const testModule = require('../../../src/components/routes/incoming_webhooks.js');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('incoming webhooks', () => {
  let webserver;
  let controller;

  beforeEach(() => {
    webserver = {
      post: sinon.stub(),
      use: sinon.spy(),
    };

    controller = {
      spawn: sinon.stub(),
      handleWebhookPayload: sinon.stub(),
    };
    testModule(webserver, controller);
  });

  it('should register middleware', () => {
    expect(webserver.use.calledOnce);
    expect(webserver.use.args[0][0]).to.equal('/ciscospark/receive');
    expect(webserver.use.args[0][1]).to.be.an('Array');
  });

  it('should register a post event', () => {
    expect(webserver.post.calledOnce).to.be.true;
    expect(webserver.post.args[0][0]).to.equal('/ciscospark/receive');
    expect(webserver.post.args[0][1]).to.be.a('Function');
  });

  describe('webserver post callback', () => {
    let webserverPostCallback;
    let request;
    let response;

    beforeEach(() => {
      webserverPostCallback = webserver.post.args[0][1];

      response = {
        status: sinon.stub(),
        send: sinon.stub(),
      };
      response.status.returns({ send: response.send });

      request = {
        get: sinon.stub(),
      };
    });

    describe('when no secret is specified', () => {
      [undefined, 'right'].forEach((headerValue) => {
        it(`should return 200 regardless of if the calculated hmacSHA1 does not match header value (${headerValue})`, () => {
          request.hmacSHA1 = 'wrong';
          request.get.withArgs('X-Spark-Signature').returns(headerValue);

          webserverPostCallback(request, response);
          expect(response.status.calledOnce).to.be.true;
          expect(response.status.args[0][0]).to.equal(200);
          expect(response.send.calledOnce).to.be.true;
          expect(response.send.args[0][0]).to.equal('ok');
          expect(controller.handleWebhookPayload.calledOnce).to.be.true;
        });
      });

      [undefined, 'matching'].forEach((matchingHeaderValue) => {
        it('should return 200 regardless of if the calculated hmacSHA1 matches the header value', () => {
          request.hmacSHA1 = matchingHeaderValue;
          request.get.withArgs('X-Spark-Signature').returns(matchingHeaderValue);

          controller.spawn.returns('a bot');

          webserverPostCallback(request, response);
          expect(response.status.calledOnce).to.be.true;
          expect(response.status.args[0][0]).to.equal(200);
          expect(response.send.calledOnce).to.be.true;
          expect(response.send.args[0][0]).to.equal('ok');
          expect(controller.handleWebhookPayload.calledOnce).to.be.true;
          expect(controller.handleWebhookPayload.args).to.deep.equal([[request, response, 'a bot']]);
        });
      });
    });

    describe('when a secret is specified', () => {
      beforeEach(() => {
        process.env.secret = 'foo';
      });

      afterEach(() => {
        delete process.env.base_url;
      });

      [undefined, 'right'].forEach((headerValue) => {
        it(`should return 403 the calculated hmacSHA1 does not match header value (${headerValue})`, () => {
          request.hmacSHA1 = 'wrong';
          request.get.withArgs('X-Spark-Signature').returns(headerValue);

          webserverPostCallback(request, response);
          expect(response.status.calledOnce).to.be.true;
          expect(response.status.args[0][0]).to.equal(403);
          expect(response.send.calledOnce).to.be.true;
          expect(response.send.args[0][0]).to.equal('HMAC validation error');
        });
      });

      [undefined, 'matching'].forEach((matchingHeaderValue) => {
        it('should return 200 when calculated hmacSHA1 matches the header value', () => {
          request.hmacSHA1 = matchingHeaderValue;
          request.get.withArgs('X-Spark-Signature').returns(matchingHeaderValue);

          controller.spawn.returns('a bot');

          webserverPostCallback(request, response);
          expect(response.status.calledOnce).to.be.true;
          expect(response.status.args[0][0]).to.equal(200);
          expect(response.send.calledOnce).to.be.true;
          expect(response.send.args[0][0]).to.equal('ok');
          expect(controller.handleWebhookPayload.calledOnce).to.be.true;
          expect(controller.handleWebhookPayload.args).to.deep.equal([[request, response, 'a bot']]);
        });
      });
    });
  });
});
