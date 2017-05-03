const sinon = require('sinon');
const expect = require('chai').expect;
const changeRequestAssigned = require('../../src/skills/change_request_assigned.js');
const assignedController = require('../../src/skillsControllers/assigned_controller.js');

describe('change request assigned', () => {
  const controller = { hears: sinon.spy() };

  beforeEach(() => {
    changeRequestAssigned(controller);
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['cr assigned']);
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

      expect(assignedController.getAssignedEntities.calledOnce).to.be.true;
      expect(assignedController.getAssignedEntities.args[0]).to.deep.equal(['change_request', 'Change Requests', bot, message]);
    });
  });
});
