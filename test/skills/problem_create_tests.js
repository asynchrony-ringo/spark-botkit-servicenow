const sinon = require('sinon');
const expect = require('chai').expect;
const problemCreate = require('../../src/skills/problem_create.js');
const createController = require('../../src/skillsControllers/create_controller.js');

describe('problem create', () => {
  const controller = { hears: sinon.spy() };

  beforeEach(() => {
    problemCreate(controller);
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['^problem create <(.*)>$']);
    expect(controller.hears.args[0][1]).to.equal('direct_message, direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let listenerCallback;
    let bot;
    const problem = {
      short_description: 'Some description.',
      opened_by: 'someone@example.com',
    };
    const message = {
      match: 'problem create <Some description.>'.match(/problem create <(.*)>/),
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
      expect(createController.replyWithStatus.args[0]).to.deep.equal(['problem', problem, 'Problem', bot, message]);
    });
  });
});
