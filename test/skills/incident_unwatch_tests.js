const sinon = require('sinon');
const expect = require('chai').expect;
const incidentUnwatch = require('../../src/skills/incident_unwatch.js');
const watchController = require('../../src/skillsControllers/watch_controller.js');

describe('incident unwatch', () => {
  const controller = { hears: sinon.spy() };

  beforeEach(() => {
    incidentUnwatch(controller);
    process.env.serviceNowBaseUrl = 'servicenow-instance.domain';
  });

  afterEach(() => {
    delete process.env.serviceNowBaseUrl;
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['incident remove watch[ ]+(.*)[ ]*']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let listenerCallback;

    const message = {
      match: 'incident remove watch someSysId'.match(/incident remove watch[ ]+(.*)[ ]*/),
      user: 'someone@example.com',
    };

    beforeEach(() => {
      listenerCallback = controller.hears.args[0][2];

      sinon.stub(watchController, 'unwatchEntity');
    });

    afterEach(() => {
      watchController.unwatchEntity.restore();
    });

    it('should call watchController\'s unwatchEntity method', () => {
      listenerCallback(bot, message);

      expect(watchController.unwatchEntity.calledOnce).to.be.true;
      expect(watchController.unwatchEntity.args[0]).to.deep.equal(['incident', 'someSysId', 'Incident', bot, message]);
    });
  });
});
