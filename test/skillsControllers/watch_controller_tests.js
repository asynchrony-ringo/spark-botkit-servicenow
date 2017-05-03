const sinon = require('sinon');
const expect = require('chai').expect;
const watchController = require('../../src/skillsControllers/watch_controller.js');
const controllerHelper = require('../../src/skillsControllers/controller_helper.js');
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

      sinon.stub(serviceNowClient, 'getTableRecord').returns(Promise.resolve());
      sinon.stub(serviceNowClient, 'getTableRecords').returns(Promise.resolve());
      sinon.stub(serviceNowClient, 'updateTableRecord').returns(Promise.resolve());
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
          expect(bot.reply.args[0]).to.deep.equal([message, `Sorry, I was unable to add you to the watch list for the ${description}: ${entityId}. Bad Things`]);
        });
    });

    describe('when the entity is not found', () => {
      beforeEach(() => {
        const malformedEntity = {};
        const tableRecordPromise = Promise.resolve(malformedEntity);

        serviceNowClient.getTableRecord.returns(tableRecordPromise);
      });

      it('should reply with appropriate error message', () => {
        return watchController.watchEntity(tableName, entityId, description, bot, message)
          .then(() => {
            expect(bot.reply.calledOnce).to.be.true;
            expect(bot.reply.args[0]).to.deep.equal([message, `Sorry, I was unable to add you to the watch list for the ${description}: ${entityId}. Unable to find the ServiceNow item.`]);
          });
      });
    });

    describe('when the entity is found', () => {
      beforeEach(() => {
        const tableRecordPromise = Promise.resolve(entity);

        serviceNowClient.getTableRecord.returns(tableRecordPromise);

        sinon.spy(controllerHelper, 'addToCSV');
      });

      afterEach(() => {
        controllerHelper.addToCSV.restore();
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
              expect(bot.reply.args[0]).to.deep.equal([message, `Sorry, I was unable to add you to the watch list for the ${description}: ${entityId}. No ServiceNow user account found.`]);
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

        it('should add user to watch list for entity', () => {
          return watchController.watchEntity(tableName, entityId, description, bot, message)
            .then(() => {
              expect(controllerHelper.addToCSV.calledOnce).to.be.true;
              expect(controllerHelper.addToCSV.args[0]).to.deep.equal(
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
                expect(bot.reply.args[0]).to.deep.equal([message, `Sorry, I was unable to add you to the watch list for the ${description}: ${entityId}. Bad things`]);
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
                expect(bot.reply.args[0]).to.deep.equal([message, `You have been added to the watch list for the ${description}: [${entityId}](${process.env.serviceNowBaseUrl}/${tableName}.do?sys_id=${entityId})`]);
              });
          });
        });
      });
    });
  });

  describe('unwatchEntity', () => {
    let bot;
    const entityId = 'entityId';
    const tableName = 'entity_table';
    const description = 'entity';
    const userId = 'userId';

    const message = {
      user: 'someone@example.com',
    };

    const entity = {
      result: {
        id: entityId,
        watch_list: userId,
      },
    };

    beforeEach(() => {
      bot = { reply: sinon.spy() };

      sinon.stub(serviceNowClient, 'getTableRecord').returns(Promise.resolve());
      sinon.stub(serviceNowClient, 'getTableRecords').returns(Promise.resolve());
      sinon.stub(serviceNowClient, 'updateTableRecord').returns(Promise.resolve());
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
      return watchController.unwatchEntity(tableName, entityId, description, bot, message)
        .then(() => {
          expect(serviceNowClient.getTableRecord.calledOnce).to.be.true;
          expect(serviceNowClient.getTableRecord.args[0]).to.deep.equal([tableName, entityId]);
        });
    });

    it('should reply with not found if record cannot be found', () => {
      const tableRecordPromise = Promise.reject('Bad Things');

      serviceNowClient.getTableRecord.returns(tableRecordPromise);
      return watchController.unwatchEntity(tableName, entityId, description, bot, message)
        .then(() => {
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0]).to.deep.equal([message, `Sorry, I was unable to remove you from the watch list for the ${description}: ${entityId}. Bad Things`]);
        });
    });

    describe('when the entity is not found', () => {
      beforeEach(() => {
        const malformedEntity = {};
        const tableRecordPromise = Promise.resolve(malformedEntity);

        serviceNowClient.getTableRecord.returns(tableRecordPromise);
      });

      it('should reply with appropriate error message', () => {
        return watchController.unwatchEntity(tableName, entityId, description, bot, message)
          .then(() => {
            expect(bot.reply.calledOnce).to.be.true;
            expect(bot.reply.args[0]).to.deep.equal([message, `Sorry, I was unable to remove you from the watch list for the ${description}: ${entityId}. Unable to find the ServiceNow item.`]);
          });
      });
    });

    describe('when the entity is found', () => {
      beforeEach(() => {
        const tableRecordPromise = Promise.resolve(entity);

        serviceNowClient.getTableRecord.returns(tableRecordPromise);

        sinon.spy(controllerHelper, 'removeFromCSV');
      });

      afterEach(() => {
        controllerHelper.removeFromCSV.restore();
      });

      it('getTableRecords should be called', () => {
        return watchController.unwatchEntity(description, entityId, description, bot, message)
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
          return watchController.unwatchEntity(description, entityId, description, bot, message)
            .then(() => {
              expect(bot.reply.calledOnce).to.be.true;
              expect(bot.reply.args[0]).to.deep.equal([message, `Sorry, I was unable to remove you from the watch list for the ${description}: ${entityId}. No ServiceNow user account found.`]);
            });
        });
      });

      describe('when the user is found', () => {
        const expectedUsers = [
          {
            sys_id: userId,
          },
        ];

        beforeEach(() => {
          serviceNowClient.getTableRecords.returns(Promise.resolve({ result: expectedUsers }));
        });

        it('should remove user from watch list for entity', () => {
          return watchController.unwatchEntity(tableName, entityId, description, bot, message)
            .then(() => {
              expect(controllerHelper.removeFromCSV.calledOnce).to.be.true;
              expect(controllerHelper.removeFromCSV.args[0]).to.deep.equal(
                [expectedUsers[0].sys_id, entity.result.watch_list]);
            });
        });

        it('should call updateTableRecord for entity', () => {
          return watchController
            .unwatchEntity(tableName, entityId, description, bot, message)
            .then(() => {
              expect(serviceNowClient.updateTableRecord.calledOnce).to.be.true;
              expect(serviceNowClient.updateTableRecord.args[0]).to.deep.equal([tableName, entityId, { watch_list: '' }]);
            });
        });

        describe('when updateTableRecord for entity fails', () => {
          beforeEach(() => {
            const updateTableRecordPromiseReject = Promise.reject('Bad things');

            serviceNowClient.updateTableRecord.returns(updateTableRecordPromiseReject);
          });

          it('should reply an appropriate error message', () => {
            return watchController.unwatchEntity(tableName, entityId, description, bot, message)
              .then(() => {
                expect(bot.reply.calledOnce).to.be.true;
                expect(bot.reply.args[0]).to.deep.equal([message, `Sorry, I was unable to remove you from the watch list for the ${description}: ${entityId}. Bad things`]);
              });
          });
        });

        describe('when updateTableRecord for entity succeeds', () => {
          beforeEach(() => {
            const updateTableRecordPromiseResolve = Promise.resolve('Good things');

            serviceNowClient.updateTableRecord.returns(updateTableRecordPromiseResolve);
          });

          it('should reply with a success message', () => {
            return watchController.unwatchEntity(tableName, entityId, description, bot, message)
              .then(() => {
                expect(bot.reply.calledOnce).to.be.true;
                expect(bot.reply.args[0]).to.deep.equal([message, `You have been removed from the watch list for the ${description}: [${entityId}](${process.env.serviceNowBaseUrl}/${tableName}.do?sys_id=${entityId})`]);
              });
          });
        });
      });
    });
  });
});
