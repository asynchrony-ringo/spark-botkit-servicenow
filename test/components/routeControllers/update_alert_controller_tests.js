const updateAlertController = require('../../../src/components/routeControllers/update_alert_controller.js');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('update alert controller', () => {
  describe('messageCaller', () => {
    let controller;
    let bot;
    const newItem = {
      id: 1234,
      callerEmail: 'some.email@some-domain.com',
      number: 'INC1234',
      shortDescription: 'An even better description.',
    };
    const oldItem = {
      id: 1234,
      callerEmail: 'some.email@some-domain.com',
      number: 'INC1234',
      shortDescription: 'A really good description.',
    };

    beforeEach(() => {
      bot = {
        startPrivateConversation: sinon.stub(),
      };
      controller = {
        spawn: sinon.stub().returns(bot),
      };
    });

    describe('when callerEmail does not exist', () => {
      beforeEach(() => {
        updateAlertController.messageCaller({}, {}, controller);
      });

      it('should not spawn a bot', () => {
        expect(controller.spawn.notCalled).to.be.true;
      });
    });

    describe('when callerEmail exists', () => {
      beforeEach(() => {
        updateAlertController.messageCaller(newItem, oldItem, controller);
      });

      it('should spawn a bot', () => {
        expect(controller.spawn.calledOnce).to.be.true;
      });

      it('should start a conversation with the returned user', () => {
        expect(bot.startPrivateConversation.calledOnce).to.be.true;
        expect(bot.startPrivateConversation.args[0][0]).to.deep.equal({ user: 'some.email@some-domain.com' });
        expect(bot.startPrivateConversation.args[0][1]).to.be.a('Function');
      });

      describe('conversation callback', () => {
        let conversationCallback;
        let conversation;

        beforeEach(() => {
          process.env.serviceNowBaseUrl = 'niceurl.some-domain.com';
          conversationCallback = bot.startPrivateConversation.args[0][1];
          conversation = { say: sinon.stub() };
        });

        afterEach(() => {
          delete process.env.serviceNowBaseUrl;
        });

        it('should not say anything on error', () => {
          conversationCallback(true, conversation);
          expect(conversation.say.notCalled).to.be.true;
        });

        it('should tell the user an incident has been updated on success', () => {
          conversationCallback(null, conversation);
          expect(conversation.say.called).to.be.true;
          expect(conversation.say.args[0][0]).to.equal('An incident you reported has been updated! [INC1234](niceurl.some-domain.com/incident.do?sys_id=1234)');
        });
      });
    });
  });

  describe('isValid', () => {
    it('should return a successful status and message when the request is of correct type', () => {
      const newObject = {
        type: 'Incident',
      };
      const oldObject = {
        type: 'Incident',
      };
      const result = updateAlertController.isValid(newObject, oldObject);
      expect(result).to.be.true;
    });

    [
      {
        new: undefined,
        old: undefined,
        description: 'new and old undefined',
      },
      {
        new: 'not an object',
        old: 'not an object',
        description: 'new and old are not objects',
      },
      {
        new: {},
        old: {},
        description: 'new and old empty objects',
      },
      {
        new: { type: 'Foo' },
        old: { type: 'Foo' },
        description: 'neither has correct attribute',
      },
      {
        new: { type: 'Incident' },
        old: {},
        description: 'new has more than old',
      },
      {
        new: {},
        old: { type: 'Incident' },
        description: 'old has more than new',
      },
      {
        new: { type: 'Incident', id: '1' },
        old: { type: 'Incident', id: '2' },
        description: 'different ids',
      },
      {
        new: { type: 'Incident', id: '1' },
        old: { id: '1' },
        description: 'old element does not contain type attribute',
      },
      {
        new: { type: 'Incident', id: '1' },
        old: { type: 'Foo', id: '1' },
        description: 'old element is not an incident',
      },
    ].forEach((testCase) => {
      it(`should return false when ${testCase.description}`, () => {
        const result = updateAlertController.isValid(testCase.new, testCase.old);
        expect(result).to.be.false;
      });
    });
  });
});
