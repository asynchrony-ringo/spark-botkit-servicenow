const sinon = require('sinon');
const expect = require('chai').expect;
const changeRequestStatus = require('../../src/skills/change_request_status.js');
const statusController = require('../../src/skillsControllers/status_controller.js');

describe('change request status', () => {
  const controller = { hears: sinon.spy() };

  beforeEach(() => {
    changeRequestStatus(controller);
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['^cr status (.*)$']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let listenerCallback;
    beforeEach(() => {
      bot = { reply: sinon.spy() };
      listenerCallback = controller.hears.args[0][2];

      sinon.stub(statusController, 'replyWithStatus');
    });

    afterEach(() => {
      statusController.replyWithStatus.restore();
    });

    it('reply with status with correct id', () => {
      const message = { match: 'cr status someSysId'.match(/cr status (.*)/) };

      listenerCallback(bot, message);

      expect(statusController.replyWithStatus.calledOnce).to.be.true;
      expect(statusController.replyWithStatus.args[0]).to.deep.equal(['change_request', 'someSysId', 'Change Request', bot, message]);
    });
  });
});
