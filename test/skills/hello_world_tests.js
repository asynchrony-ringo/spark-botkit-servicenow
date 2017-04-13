const sinon = require('sinon');
const expect = require('chai').expect;
const helloWorld = require('../../src/skills/hello_world.js');

describe('hello world', () => {
  const controller = { hears: sinon.spy() };

  beforeEach(() => {
    helloWorld(controller);
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['hello']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let message;
    beforeEach(() => {
      bot = { startConversation: sinon.spy() };
      message = 'some message';
      const listenerCallback = controller.hears.args[0][2];

      listenerCallback(bot, message);
    });

    it('should start a conversation', () => {
      expect(bot.startConversation.calledOnce).to.be.true;
      expect(bot.startConversation.args[0][0]).to.equal(message);
      expect(bot.startConversation.args[0][1]).to.be.a('function');
    });

    describe('conversation callback', () => {
      let convo;
      let error;
      beforeEach(() => {
        convo = { say: sinon.spy() };
        error = null;
        const conversationCallback = bot.startConversation.args[0][1];

        conversationCallback(error, convo);
      });

      it('should say "world!"', () => {
        expect(convo.say.calledOnce).to.be.true;
        expect(convo.say.args[0][0]).to.equal('world!');
      });
    });
  });
});
