const testModule = require('../../../src/components/routes/entity_update_webhooks.js');
const sinon = require('sinon');
const expect = require('chai').expect;
const updateAlertController = require('../../../src/components/routeControllers/update_alert_controller.js');

describe('incoming web hook for incident update', () => {
  let webserver;
  let controller;

  beforeEach(() => {
    webserver = {
      post: sinon.stub(),
    };
    controller = {};

    testModule(webserver, controller);
  });

  it('should register a post event', () => {
    expect(webserver.post.calledOnce).to.be.true;
    expect(webserver.post.args[0][0]).to.equal('/servicenow/update');
    expect(webserver.post.args[0][1]).to.be.a('Function');
  });

  describe('webserver post callback', () => {
    let webserverPostCallback;
    let request;
    let response;
    let bot;

    beforeEach(() => {
      webserverPostCallback = webserver.post.args[0][1];

      response = {
        status: sinon.stub(),
        send: sinon.stub(),
      };

      request = { body: {} };

      bot = {
        startPrivateConversation: sinon.stub(),
      };
      controller.spawn = sinon.stub().returns(bot);

      sinon.stub(updateAlertController, 'isValid').returns(true);
    });

    afterEach(() => {
      updateAlertController.isValid.restore();
    });

    describe('request validation', () => {
      const newItem = 'something';
      const oldItem = 'another thing';

      beforeEach(() => {
        request.body.new = newItem;
        request.body.old = oldItem;
      });

      it('should return a successful status and message when controller.isValid returns true', () => {
        updateAlertController.isValid.withArgs(newItem, oldItem).returns(true);
        webserverPostCallback(request, response);
        expect(response.status.calledWith(200)).to.be.true;
        expect(response.send.calledWith('ok')).to.be.true;
      });

      it('should return a bad request status and message when controller.isValid returns false', () => {
        updateAlertController.isValid.withArgs(newItem, oldItem).returns(false);
        webserverPostCallback(request, response);
        expect(response.status.calledWith(400)).to.be.true;
        expect(response.send.calledWith('Bad Request')).to.be.true;
      });
    });

    describe('when callerEmail does not exist', () => {
      const newItem = {};
      const oldItem = {};

      beforeEach(() => {
        request.body.new = newItem;
        request.body.old = oldItem;

        webserverPostCallback(request, response);
      });

      it('should not spawn a bot', () => {
        expect(controller.spawn.notCalled).to.be.true;
      });
    });

    describe('when callerEmail exists', () => {
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
        request.body.new = newItem;
        request.body.old = oldItem;

        webserverPostCallback(request, response);
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
});
