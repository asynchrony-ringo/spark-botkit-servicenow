const sinon = require('sinon');
const expect = require('chai').expect;
const entityUpdate = require('../../src/skills/entity_update.js');
const updateController = require('../../src/skillsControllers/update_controller.js');

describe('incident assign', () => {
  const controller = { hears: sinon.spy() };

  beforeEach(() => {
    entityUpdate(controller);
    process.env.base_url = 'servicenow-instance.domain';
  });

  afterEach(() => {
    delete process.env.base_url;
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['(.*) update ([^ ]*) (.*)']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let listenerCallback;

    const message = {
      match: 'entity update entityId field=[value] field2=[value]'.match(/(.*) update ([^ ]*) (.*)/),
    };

    beforeEach(() => {
      listenerCallback = controller.hears.args[0][2];

      sinon.stub(updateController, 'replyWithUpdate');
    });

    afterEach(() => {
      updateController.replyWithUpdate.restore();
    });

    it('should call updateController\'s replyWithUpdate method', () => {
      listenerCallback(bot, message);

      expect(updateController.replyWithUpdate.calledOnce).to.be.true;
      expect(updateController.replyWithUpdate.args[0]).to.deep.equal(['entity', 'entityId', 'field=[value] field2=[value]', bot, message]);
    });
  });
});
