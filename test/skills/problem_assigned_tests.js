const sinon = require('sinon');
const expect = require('chai').expect;
const problemAssigned = require('../../src/skills/problem_assigned.js');
const assignedController = require('../../src/skillsControllers/assigned_controller.js');

describe('problem assigned', () => {
  const controller = { hears: sinon.spy() };

  beforeEach(() => {
    problemAssigned(controller);
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['problem assigned']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let listenerCallback;

    const message = { user: 'somebody@somewhere.com' };

    beforeEach(() => {
      listenerCallback = controller.hears.args[0][2];

      sinon.stub(assignedController, 'getAssignedEntities');
    });

    afterEach(() => {
      assignedController.getAssignedEntities.restore();
    });

    it('should call assignedController\'s getAssignedEntities method', () => {
      listenerCallback(bot, message);

      const entity = {
        table: 'problem',
        description: 'Problems',
      };
      expect(assignedController.getAssignedEntities.calledOnce).to.be.true;
      expect(assignedController.getAssignedEntities.args[0]).to.deep.equal([entity, bot, message]);
    });
  });
});
