const sinon = require('sinon');
const expect = require('chai').expect;
const truncateLargeMessageMiddleware = require('../../src/skills/truncate_large_message_middleware.js');

describe('truncateLargeMessageMiddleware', () => {
  let controller;

  beforeEach(() => {
    controller = { middleware: { send: { use: sinon.spy() } } };

    truncateLargeMessageMiddleware(controller);
  });

  it('should register hear listener on controller', () => {
    expect(controller.middleware.send.use.calledOnce).to.be.true;
    expect(controller.middleware.send.use.args[0][0]).to.be.a('function');
  });

  describe('use callback', () => {
    let useCallback;
    const bot = {};
    let next;

    beforeEach(() => {
      useCallback = controller.middleware.send.use.args[0][0];
      next = sinon.spy();
    });

    it('should not truncate the message when it is under 6000 characters in length', () => {
      const message = {
        text: 'aaaaa',
      };

      useCallback(bot, message, next);

      expect(message.text).to.be.equal('aaaaa');
      expect(next.calledOnce).to.be.true;
    });

    it('should not truncate the message when it is equal to 6000 characters in length', () => {
      let text = '';
      for (let i = 0; i < 6000; i += 1) {
        text += 'a';
      }
      const expectedText = text;

      const message = {
        text,
      };

      useCallback(bot, message, next);

      expect(message.text).to.be.equal(expectedText);
      expect(next.calledOnce).to.be.true;
    });

    it('should truncate the message when it is over 6000 characters in length', () => {
      let text = '';
      for (let i = 0; i < 6001; i += 1) {
        text += 'a';
      }

      const message = {
        text,
      };

      useCallback(bot, message, next);

      let expectedText = '';
      for (let i = 0; i < 6000; i += 1) {
        expectedText += 'a';
      }
      expectedText += '...';

      expect(message.text).to.be.equal(expectedText);
      expect(next.calledOnce).to.be.true;
    });
  });
});
