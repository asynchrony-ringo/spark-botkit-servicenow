const sinon = require('sinon');
const expect = require('chai').expect;
const assignUserController = require('../../src/skillsControllers/assign_user_controller.js');
const serviceNowClient = require('../../src/service_now_client.js');

describe('assign user controller', () => {
  describe('assignUserToEntity', () => {
    const entity = {
      table: 'entity_table',
      description: 'entity',
    };

    const bot = { reply: sinon.spy() };

    const message = {
      match: 'incident watch someSysId'.match(/incident watch (.*)/),
      user: 'someone@example.com',
    };

    beforeEach(() => {
      sinon.stub(serviceNowClient, 'getTableRecords').returns({
        then: () => Promise.resolve(),
        catch: () => Promise.reject(),
      });

      sinon.stub(serviceNowClient, 'updateTableRecord').returns({
        then: () => Promise.resolve(),
        catch: () => Promise.reject(),
      });

      process.env.serviceNowBaseUrl = 'servicenow-instance.domain';
    });

    afterEach(() => {
      serviceNowClient.getTableRecords.restore();
      serviceNowClient.updateTableRecord.restore();
      delete process.env.serviceNowBaseUrl;
    });

    it('getTableRecords should be called', () => {
      return assignUserController.assignUserToEntity(entity, bot, message)
        .then(() => {
          expect(serviceNowClient.getTableRecords.calledOnce).to.be.true;
          expect(serviceNowClient.getTableRecords.args[0]).to.deep.equal(['sys_user', { sysparm_query: `email=${message.user}` }]);
        });
    });

    describe('when the user is not found', () => {
      beforeEach(() => {
        serviceNowClient.getTableRecords.withArgs('sys_user', { sysparm_query: `email=${message.user}` }).returns(Promise.resolve({ result: [] }));
      });

      it('should reply with appropriate error message', () => {
        return assignUserController.assignUserToEntity(entity, bot, message)
            .then(() => {
              expect(bot.reply.calledOnce).to.be.true;
              expect(bot.reply.args[0][0]).to.deep.equal(message);
              expect(bot.reply.args[0][1]).to.equal('Sorry, I was unable to find your user account.');
            });
      });
    });

    describe('when the user is found', () => {
      const expectedUsers = [
        {
          sys_id: '12345',
        },
      ];

      beforeEach(() => {
        serviceNowClient.getTableRecords.returns(Promise.resolve({ result: expectedUsers }));
      });

      it('should call updateTableRecord for entity', () => {
        serviceNowClient.updateTableRecord.returns(Promise.resolve({ result: 'test' }));
        return assignUserController.assignUserToEntity(entity, bot, message)
          .then(() => {
            expect(serviceNowClient.updateTableRecord.calledOnce).to.be.true;
            expect(serviceNowClient.updateTableRecord.args[0]).to.deep.equal(['entity_table', 'someSysId', { assigned_to: '12345' }]);
          });
      });
    });
  });
});
