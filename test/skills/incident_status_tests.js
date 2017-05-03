const sinon = require('sinon');
const expect = require('chai').expect;
const incidentStatus = require('../../src/skills/incident_status.js');
const statusController = require('../../src/skillsControllers/status_controller.js');

describe('incident status', () => {
  const controller = { hears: sinon.spy() };

  beforeEach(() => {
    incidentStatus(controller);
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['incident status (.*)']);
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
      const message = { match: 'incident status  someSysId   '.match(/incident status (.*)/) };

      listenerCallback(bot, message);

      expect(statusController.replyWithStatus.calledOnce).to.be.true;
      expect(statusController.replyWithStatus.args[0]).to.deep.equal(['incident', 'someSysId', 'Incident', {}, bot, message]);
    });
  });
});
