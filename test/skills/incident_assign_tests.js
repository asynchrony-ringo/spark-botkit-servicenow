const sinon = require('sinon');
const expect = require('chai').expect;
const incidentAssign = require('../../src/skills/incident_assign.js');
const assignUserController = require('../../src/skillsControllers/assign_user_controller.js');

describe('incident assign', () => {
  const controller = { hears: sinon.spy() };

  beforeEach(() => {
    incidentAssign(controller);
    process.env.serviceNowBaseUrl = 'servicenow-instance.domain';
  });

  afterEach(() => {
    delete process.env.serviceNowBaseUrl;
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['incident assign (.*)']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let listenerCallback;

    const message = {
      match: 'incident assign  someSysId  '.match(/incident assign (.*)/),
      user: 'someone@example.com',
    };

    beforeEach(() => {
      listenerCallback = controller.hears.args[0][2];

      sinon.stub(assignUserController, 'assignUserToEntity');
    });

    afterEach(() => {
      assignUserController.assignUserToEntity.restore();
    });

    it('should call assignUserController\'s assignUserToEntity method', () => {
      listenerCallback(bot, message);

      expect(assignUserController.assignUserToEntity.calledOnce).to.be.true;
      expect(assignUserController.assignUserToEntity.args[0]).to.deep.equal(['incident', 'someSysId', 'Incident', bot, message]);
    });
  });
});
