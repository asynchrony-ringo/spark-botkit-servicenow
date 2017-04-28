const sinon = require('sinon');
const expect = require('chai').expect;
const changeRequestCreate = require('../../src/skills/change_request_create.js');
const createController = require('../../src/skillsControllers/create_controller.js');

describe('change request create', () => {
  const controller = { hears: sinon.spy() };

  beforeEach(() => {
    changeRequestCreate(controller);
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['cr create <(.*)> <(.*)>']);
    expect(controller.hears.args[0][1]).to.equal('direct_message, direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let listenerCallback;
    let bot;
    const changeRequest = {
      short_description: 'description',
      category: 'category',
    };
    const message = {
      match: 'cr create <description> <category>'.match(/cr create <(.*)> <(.*)>/),
      user: 'someone@example.com',
    };

    beforeEach(() => {
      bot = { reply: sinon.spy() };
      sinon.stub(createController, 'replyWithStatus');
      listenerCallback = controller.hears.args[0][2];
    });

    afterEach(() => {
      createController.replyWithStatus.restore();
    });

    it('should call create controller\'s replyWithStatus method', () => {
      listenerCallback(bot, message);
      expect(createController.replyWithStatus.calledOnce).to.be.true;
      expect(createController.replyWithStatus.args[0]).to.deep.equal(['change_request', changeRequest, 'change request', bot, message]);
    });
  });
});
