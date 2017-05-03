const sinon = require('sinon');
const expect = require('chai').expect;
const changeRequestWatch = require('../../src/skills/change_request_watch.js');
const watchController = require('../../src/skillsControllers/watch_controller.js');

describe('change request watch', () => {
  const controller = { hears: sinon.spy() };

  beforeEach(() => {
    changeRequestWatch(controller);
    process.env.serviceNowBaseUrl = 'servicenow-instance.domain';
  });

  afterEach(() => {
    delete process.env.serviceNowBaseUrl;
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['cr watch (.*)']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let listenerCallback;

    const message = {
      match: 'cr watch  someSysId  '.match(/cr watch (.*)/),
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
      expect(watchController.watchEntity.args[0]).to.deep.equal(['change_request', 'someSysId', 'Change Request', bot, message]);
    });
  });
});
