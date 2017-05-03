const sinon = require('sinon');
const expect = require('chai').expect;
const problemUnwatch = require('../../src/skills/problem_unwatch.js');
const watchController = require('../../src/skillsControllers/watch_controller.js');

describe('problem unwatch', () => {
  const controller = { hears: sinon.spy() };

  beforeEach(() => {
    problemUnwatch(controller);
    process.env.serviceNowBaseUrl = 'servicenow-instance.domain';
  });

  afterEach(() => {
    delete process.env.serviceNowBaseUrl;
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['^problem remove watch[ ]+(.*)[ ]*$']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let listenerCallback;

    const message = {
      match: 'problem remove watch someSysId'.match(/problem remove watch[ ]+(.*)[ ]*/),
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
      expect(watchController.unwatchEntity.args[0]).to.deep.equal(['problem', 'someSysId', 'Problem', bot, message]);
    });
  });
});
