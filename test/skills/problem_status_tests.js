const sinon = require('sinon');
const expect = require('chai').expect;
const problemStatus = require('../../src/skills/problem_status.js');
const statusController = require('../../src/skillsControllers/status_controller.js');

describe('problem status', () => {
  const controller = { hears: sinon.spy() };

  beforeEach(() => {
    problemStatus(controller);
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['^problem status[ ]+(.*)[ ]*$']);
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
      const message = { match: 'problem status someSysId'.match(/problem status[ ]+(.*)[ ]*/) };

      listenerCallback(bot, message);

      expect(statusController.replyWithStatus.calledOnce).to.be.true;
      expect(statusController.replyWithStatus.args[0]).to.deep.equal(['problem', 'someSysId', 'Problem', {}, bot, message]);
    });
  });
});
