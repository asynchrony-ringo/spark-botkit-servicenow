const updateAlertController = require('../../../src/components/routeControllers/update_alert_controller.js');
const sinon = require('sinon');
const expect = require('chai').expect;
const updateAlertDifferenceGatherer = require('../../../src/components/routeControllers/update_alert_difference_gatherer.js');

describe('update alert controller', () => {
  describe('messageCaller', () => {
    let controller;
    let bot;
    const newItem = {
      id: 1234,
      callerEmail: 'some.email@some-domain.com',
      number: 'INC1234',
      shortDescription: 'An even better description.',
      type: 'SOME TYPE',
    };
    const oldItem = {
      id: 1234,
      callerEmail: 'some.email@some-domain.com',
      number: 'INC1234',
      shortDescription: 'A really good description.',
      type: 'SOME TYPE',
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
          sinon.stub(updateAlertDifferenceGatherer, 'formatMessage');
          conversationCallback = bot.startPrivateConversation.args[0][1];
          conversation = { say: sinon.stub() };
        });

        afterEach(() => {
          delete process.env.serviceNowBaseUrl;
          updateAlertDifferenceGatherer.formatMessage.restore();
        });

        it('should not say anything on error', () => {
          conversationCallback(true, conversation);
          expect(conversation.say.notCalled).to.be.true;
        });

        it('should tell the user an entity has been updated on success', () => {
          const expectedDifferenceMessage = 'Here is a really good difference message';
          updateAlertDifferenceGatherer.formatMessage
            .withArgs(newItem, oldItem)
            .returns(expectedDifferenceMessage);

          conversationCallback(null, conversation);
          expect(conversation.say.called).to.be.true;
          expect(conversation.say.args[0][0]).to.equal(`The SOME TYPE [INC1234](niceurl.some-domain.com/some_type.do?sys_id=1234) has been updated!\n${expectedDifferenceMessage}`);
        });
      });
    });
  });

  describe('isValid', () => {
    it('should return a successful status and message when new and old are the same type', () => {
      const newObject = {
        type: 'Type',
        id: 1234,
      };
      const oldObject = {
        type: 'Type',
        id: 1234,
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
