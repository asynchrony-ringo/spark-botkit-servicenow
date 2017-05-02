const sinon = require('sinon');
const expect = require('chai').expect;
const incidentWatch = require('../../src/skills/incident_watch.js');
const watchController = require('../../src/skillsControllers/watch_controller.js');

describe('incident watch', () => {
  const controller = { hears: sinon.spy() };

  beforeEach(() => {
    incidentWatch(controller);
    process.env.serviceNowBaseUrl = 'servicenow-instance.domain';
  });

  afterEach(() => {
    delete process.env.serviceNowBaseUrl;
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['incident watch (.*)']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let listenerCallback;

    const message = {
      match: 'incident watch someSysId'.match(/incident watch (.*)/),
      user: 'someone@example.com',
    };

    beforeEach(() => {
      listenerCallback = controller.hears.args[0][2];

      sinon.stub(watchController, 'watchEntity');
    });

    afterEach(() => {
      watchController.watchEntity.restore();
    });

    it('should call assignUserController\'s assignUserToEntity method', () => {
      listenerCallback(bot, message);

      expect(watchController.watchEntity.calledOnce).to.be.true;
      expect(watchController.watchEntity.args[0]).to.deep.equal(['incident', 'someSysId', 'Incident', bot, message]);
    });
  });
});
