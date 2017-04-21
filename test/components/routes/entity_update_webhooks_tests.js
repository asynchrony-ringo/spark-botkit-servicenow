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
    const newItem = 'something';
    const oldItem = 'another thing';

    beforeEach(() => {
      webserverPostCallback = webserver.post.args[0][1];

      response = {
        status: sinon.stub(),
        send: sinon.stub(),
      };

      request = {
        body: {
          new: newItem,
          old: oldItem,
        },
      };

      sinon.stub(updateAlertController, 'isValid').returns(true);
      sinon.stub(updateAlertController, 'messageCaller');
    });

    afterEach(() => {
      updateAlertController.isValid.restore();
      updateAlertController.messageCaller.restore();
    });

    describe('request validation', () => {
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

    it('calls controller.messageCaller', () => {
      webserverPostCallback(request, response);
      expect(updateAlertController.messageCaller.calledOnce).to.be.true;
      expect(updateAlertController.messageCaller.args[0][0]).to.equal(newItem);
      expect(updateAlertController.messageCaller.args[0][1]).to.equal(oldItem);
      expect(updateAlertController.messageCaller.args[0][2]).to.equal(controller);
    });
  });
});
