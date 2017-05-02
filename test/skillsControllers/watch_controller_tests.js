const sinon = require('sinon');
const expect = require('chai').expect;
const watchController = require('../../src/skillsControllers/watch_controller.js');
const watchListHelper = require('../../src/skillsControllers/watch_list_helper.js');
const serviceNowClient = require('../../src/service_now_client.js');

describe('watch controller', () => {
  describe('watchEntity', () => {
    let bot;
    const entityId = 'entityId';
    const tableName = 'entity_table';
    const description = 'entity';

    const message = {
      user: 'someone@example.com',
    };

    const entity = {
      result: {
        id: entityId,
        watch_list: '',
      },
    };

    beforeEach(() => {
      bot = { reply: sinon.spy() };

      sinon.stub(serviceNowClient, 'getTableRecord').returns({
        then: () => Promise.resolve(),
        catch: () => Promise.reject(),
      });
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
      serviceNowClient.getTableRecord.restore();
      serviceNowClient.getTableRecords.restore();
      serviceNowClient.updateTableRecord.restore();
      delete process.env.serviceNowBaseUrl;
    });

    it('should look up table record based on id', () => {
      serviceNowClient.getTableRecord.returns(Promise.resolve());
      return watchController.watchEntity(tableName, entityId, description, bot, message)
        .then(() => {
          expect(serviceNowClient.getTableRecord.calledOnce).to.be.true;
          expect(serviceNowClient.getTableRecord.args[0]).to.deep.equal([tableName, entityId]);
        });
    });

    it('should reply with not found if record cannot be found', () => {
      const tableRecordPromise = Promise.reject('Bad Things');

      serviceNowClient.getTableRecord.returns(tableRecordPromise);
      return watchController.watchEntity(tableName, entityId, description, bot, message)
        .then(() => {
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0]).to.deep.equal([message, `Sorry, I was unable to find the ${description}: ${entityId}. Bad Things`]);
        });
    });

    describe('when the entity is not found', () => {
      beforeEach(() => {
        const malformedIncident = {};
        const tableRecordPromise = Promise.resolve(malformedIncident);

        serviceNowClient.getTableRecord.returns(tableRecordPromise);
      });

      it('should reply with appropriate error message', () => {
        return watchController.watchEntity(tableName, entityId, description, bot, message)
          .then(() => {
            expect(bot.reply.calledOnce).to.be.true;
            expect(bot.reply.args[0]).to.deep.equal([message, `Sorry, I was unable to find the ${description}: ${entityId}`]);
          });
      });
    });

    describe('when the incident is found', () => {
      beforeEach(() => {
        const tableRecordPromise = Promise.resolve(entity);

        serviceNowClient.getTableRecord.returns(tableRecordPromise);

        sinon.spy(watchListHelper, 'addUserToWatchList');
      });

      afterEach(() => {
        watchListHelper.addUserToWatchList.restore();
      });

      it('getTableRecords should be called', () => {
        return watchController.watchEntity(description, entityId, description, bot, message)
          .then(() => {
            expect(serviceNowClient.getTableRecords.calledOnce).to.be.true;
            expect(serviceNowClient.getTableRecords.args[0]).to.deep.equal(['sys_user', { sysparm_query: `email=${message.user}` }]);
          });
      });

      describe('when the user is not found', () => {
        beforeEach(() => {
          serviceNowClient.getTableRecords.returns(Promise.resolve({ result: [] }));
        });

        it('should reply with appropriate error message', () => {
          return watchController.watchEntity(description, entityId, description, bot, message)
            .then(() => {
              expect(bot.reply.calledOnce).to.be.true;
              expect(bot.reply.args[0]).to.deep.equal([message, 'Sorry, I was unable to find your user account.']);
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

        it('should add user to watchlist for entity', () => {
          return watchController.watchEntity(tableName, entityId, description, bot, message)
            .then(() => {
              expect(watchListHelper.addUserToWatchList.calledOnce).to.be.true;
              expect(watchListHelper.addUserToWatchList.args[0]).to.deep.equal(
                [expectedUsers[0].sys_id, entity.result.watch_list]);
            });
        });

        it('should call updateTableRecord for entity', () => {
          return watchController
            .watchEntity(tableName, entityId, description, bot, message)
            .then(() => {
              expect(serviceNowClient.updateTableRecord.calledOnce).to.be.true;
              expect(serviceNowClient.updateTableRecord.args[0]).to.deep.equal([tableName, entityId, { watch_list: '12345' }]);
            });
        });

        describe('when updateTableRecord for entity fails', () => {
          beforeEach(() => {
            const updateTableRecordPromiseReject = Promise.reject('Bad things');

            serviceNowClient.updateTableRecord.returns(updateTableRecordPromiseReject);
          });

          it('should reply an appropriate error message', () => {
            return watchController.watchEntity(tableName, entityId, description, bot, message)
              .then(() => {
                expect(bot.reply.calledOnce).to.be.true;
                expect(bot.reply.args[0]).to.deep.equal([message, `Sorry, I was unable to update the ${description}: Bad things`]);
              });
          });
        });

        describe('when updateTableRecord for entity succeeds', () => {
          beforeEach(() => {
            const updateTableRecordPromiseResolve = Promise.resolve('Good things');

            serviceNowClient.updateTableRecord.returns(updateTableRecordPromiseResolve);
          });

          it('should reply with a success message', () => {
            return watchController.watchEntity(tableName, entityId, description, bot, message)
              .then(() => {
                expect(bot.reply.calledOnce).to.be.true;
                expect(bot.reply.args[0]).to.deep.equal([message, `You have been added to the watchlist for the ${description}: [${entityId}](${process.env.serviceNowBaseUrl}/${tableName}.do?sys_id=${entityId})`]);
              });
          });
        });
      });
    });
  });
});
