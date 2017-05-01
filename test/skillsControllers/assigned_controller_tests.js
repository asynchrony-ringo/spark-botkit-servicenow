const sinon = require('sinon');
const expect = require('chai').expect;
const assignedController = require('../../src/skillsControllers/assigned_controller.js');
const serviceNowClient = require('../../src/service_now_client.js');

describe('assigned controller', () => {
  describe('getAssignedEntities', () => {
    let bot;
    const message = {
      user: 'someone@example.com',
    };

    const tableName = 'entity_table';
    const description = 'foo';

    beforeEach(() => {
      bot = { reply: sinon.spy() };

      sinon.stub(serviceNowClient, 'getTableRecords').returns({
        then: () => Promise.resolve(),
        catch: () => Promise.reject(),
      });
      process.env.serviceNowBaseUrl = 'service-now-baseurl.wow';
    });

    afterEach(() => {
      serviceNowClient.getTableRecords.restore();
      delete process.env.serviceNowBaseURL;
    });

    it('calls getTableRecords for specified entity type', () => {
      return assignedController.getAssignedEntities(tableName, description, bot, message)
        .then(() => {
          expect(serviceNowClient.getTableRecords.calledOnce).to.be.true;
          expect(serviceNowClient.getTableRecords.args[0][0]).to.equal(tableName);
          expect(serviceNowClient.getTableRecords.args[0][1]).to.deep.equal({ sysparm_query: `assigned_to.email=${message.user}^ORDERBYDESCsys_updated_on` });
        });
    });

    describe('when getTableRecords is rejected', () => {
      it('responds with the appropriate error message', () => {
        serviceNowClient.getTableRecords.returns(Promise.reject('Bad things'));

        return assignedController.getAssignedEntities(tableName, description, bot, message)
          .then(() => {
            expect(bot.reply.calledOnce).to.be.true;
            expect(bot.reply.args[0]).to.deep.equal([message, `Sorry, I was unable to retrieve your assigned ${description}. Bad things`]);
          });
      });
    });

    describe('when malformed response', () => {
      [{}, { foo: 'bar' }].forEach((testCase) => {
        it(`should reply with appropriate error if record is malformed:  ${JSON.stringify(testCase)}`, () => {
          const tableRecordPromise = Promise.resolve(testCase);

          serviceNowClient.getTableRecords.returns(tableRecordPromise);

          return assignedController.getAssignedEntities(tableName, description, bot, message)
            .then(() => {
              expect(bot.reply.calledOnce).to.be.true;
              expect(bot.reply.args[0]).deep.to.equal([message, `Sorry, I was unable to retrieve your assigned ${description}.`]);
            });
        });
      });
    });

    describe('when valid response', () => {
      it('should reply with appropriate message when 0 records are found', () => {
        const tableRecordPromise = Promise.resolve({ result: [] });
        serviceNowClient.getTableRecords.returns(tableRecordPromise);

        return assignedController.getAssignedEntities(tableName, description, bot, message)
          .then(() => {
            expect(bot.reply.calledOnce).to.be.true;
            expect(bot.reply.args[0]).to.deep.equal([message, `Found no assigned ${description}.`]);
          });
      });


      it('should reply with entity descriptions when > 0 && < 11 records are found', () => {
        [
          [
            { sys_id: '1234', number: 'INC1234', short_description: 'description for 1234' },
          ],
          [
            { sys_id: '0001', number: 'EN0001', short_description: 'description for 0001' },
            { sys_id: '0002', number: 'EN0002', short_description: 'description for 0002' },
            { sys_id: '0003', number: 'EN0003', short_description: 'description for 0003' },
            { sys_id: '0004', number: 'EN0004', short_description: 'description for 0004' },
            { sys_id: '0005', number: 'EN0005', short_description: 'description for 0005' },
            { sys_id: '0006', number: 'EN0006', short_description: 'description for 0006' },
            { sys_id: '0007', number: 'EN0007', short_description: 'description for 0007' },
            { sys_id: '0008', number: 'EN0008', short_description: 'description for 0008' },
            { sys_id: '0009', number: 'EN0009', short_description: 'description for 0009' },
            { sys_id: '0010', number: 'EN0010', short_description: 'description for 0010' },
          ],
        ].forEach((testCase) => {
          const records = { result: testCase };
          let expectedResponse = `Found 2 assigned ${description}:\n\n`;

          records.result.forEach((record) => {
            expectedResponse += ` * [${record.number}](service-now-baseurl.wow/${tableName}.do?sys_id=${record.sys_id}): ${record.short_description}\n`;
          });

          const tableRecordPromise = Promise.resolve(records);
          serviceNowClient.getTableRecords.returns(tableRecordPromise);

          return assignedController.getAssignedEntities(tableName, description, bot, message)
            .then(() => {
              expect(bot.reply.calledOnce).to.be.true;
              expect(bot.reply.args[0][0]).to.equal(message);
              expect(bot.reply.args[0][1]).to.equal(expectedResponse);
            });
        });
      });

      it('should reply with 10 most recently updated entities when there are more than 10 records', () => {
        const records = { result: [
        ] };

        for (let i = 0; i < 100; i += 1) {
          records.result.push({ sys_id: i, number: `INC${i}`, short_description: `description for ${i}` });
        }

        let expectedResponse = `Found 100 assigned ${description}. Here are the most recently updated 10:\n\n`;
        records.result.slice(0, 10).forEach((record) => {
          expectedResponse += ` * [${record.number}](service-now-baseurl.wow/${tableName}.do?sys_id=${record.sys_id}): ${record.short_description}\n`;
        });

        const tableRecordPromise = Promise.resolve(records);

        serviceNowClient.getTableRecords.returns(tableRecordPromise);

        return assignedController.getAssignedEntities(tableName, description, bot, message)
          .then(() => {
            expect(bot.reply.calledOnce).to.be.true;
            expect(bot.reply.args[0]).to.deep.equal([message, expectedResponse]);
          });
      });
    });
  });
});
