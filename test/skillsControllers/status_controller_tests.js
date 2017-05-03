const sinon = require('sinon');
const expect = require('chai').expect;
const serviceNowClient = require('../../src/service_now_client.js');
const statusController = require('../../src/skillsControllers/status_controller.js');

describe('status controller', () => {
  const table = 'tableName';
  const entityId = 'entityId';
  const description = 'Entity';
  let bot;

  beforeEach(() => {
    bot = { reply: sinon.spy() };

    sinon.stub(serviceNowClient, 'getTableRecord').returns(Promise.resolve());
    process.env.serviceNowBaseUrl = 'servicenow-instance.domain';
  });

  afterEach(() => {
    serviceNowClient.getTableRecord.restore();
    delete process.env.serviceNowBaseUrl;
  });

  it('should look up table record based on id', () => {
    const message = { some: 'message' };

    return statusController.replyWithStatus(table, entityId, description, {}, bot, message)
      .then(() => {
        expect(serviceNowClient.getTableRecord.calledOnce).to.be.true;
        expect(serviceNowClient.getTableRecord.args[0][0]).to.equal(table);
        expect(serviceNowClient.getTableRecord.args[0][1]).to.equal(entityId);
      });
  });

  it('should reply with not found if record cannot be found', () => {
    const tableRecordPromise = Promise.reject('Bad things');
    const message = { some: 'message' };

    serviceNowClient.getTableRecord.withArgs(table, entityId).returns(tableRecordPromise);

    return statusController.replyWithStatus(table, entityId, description, { attribute: 'obj' }, bot, message)
      .then(() => {
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0][0]).to.equal(message);
        expect(bot.reply.args[0][1]).to.equal(`Sorry, I was unable to retrieve the ${description}: ${entityId}. Bad things`);
      });
  });

  describe('when record found', () => {
    [
      {
        entity: { single: 'field' },
        attributes: { single: 'Field Display Value' },
        expectedListMarkdown: '* Field Display Value: field\n',
        testDescription: 'single field matched field in attributes map',
      },
      {
        entity: { excludedField1: 'excludedValue1', includedField1: 'includedValue1', excludedField2: 'excludedValue2', includedField2: 'includedValue2' },
        attributes: { includedField1: 'Field 1', includedField2: 'Field 2' },
        expectedListMarkdown: '* Field 1: includedValue1\n* Field 2: includedValue2\n',
        testDescription: 'fields are not included in attributes map',
      },
      {
        entity: { excludedField1: 'excludedValue1', includedField1: 'includedValue1', excludedField2: 'excludedValue2', includedField2: 'includedValue2' },
        attributes: { includedField2: 'Field 2', includedField1: 'Field 1' },
        expectedListMarkdown: '* Field 2: includedValue2\n* Field 1: includedValue1\n',
        testDescription: 'attributes has different field order than entity',
      },
      {
        entity: { nullField: null, falseField: false },
        attributes: { undefinedField: 'Not Found In Entity', nullField: 'Null value', falseField: 'False value' },
        expectedListMarkdown: '* Not Found In Entity: \n* Null value: \n* False value: false\n',
        testDescription: 'null, undefined, and false values exist',
      },
      {
        entity: { entity: 'value' },
        attributes: {},
        expectedListMarkdown: '',
        testDescription: 'No attributes are given!',
      },
    ].forEach((testCase) => {
      const { entity, attributes, expectedListMarkdown, testDescription } = testCase;
      it(`should reply with correct status when ${testDescription}`, () => {
        const tableRecordPromise = Promise.resolve({ result: entity });
        const message = { some: 'message' };

        serviceNowClient.getTableRecord.withArgs(table, entityId).returns(tableRecordPromise);

        return statusController
          .replyWithStatus(table, entityId, description, attributes, bot, message)
          .then(() => {
            expect(bot.reply.calledOnce).to.be.true;
            expect(bot.reply.args[0][0]).to.equal(message);
            expect(bot.reply.args[0][1]).to.equal(`Information for ${description}: [${entityId}](servicenow-instance.domain/${table}.do?sys_id=${entityId})\n${expectedListMarkdown}`);
          });
      });
    });
  });
});
