const sinon = require('sinon');
const expect = require('chai').expect;
const serviceNowClient = require('../../src/service_now_client.js');
const statusController = require('../../src/skillsControllers/status_controller.js');

describe('status controller', () => {
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

    statusController.replyWithStatus('table_name', 'entity_id', 'entity description', bot, message);

    expect(serviceNowClient.getTableRecord.calledOnce).to.be.true;
    expect(serviceNowClient.getTableRecord.args[0][0]).to.equal('table_name');
    expect(serviceNowClient.getTableRecord.args[0][1]).to.equal('entity_id');
  });

  it('should reply with change request when record is found', () => {
    const tableRecordPromise = Promise.resolve({ short_description: 'description for awesome record' });
    const message = { some: 'message' };

    serviceNowClient.getTableRecord.withArgs('table_name', 'entity_id').returns(tableRecordPromise);

    return statusController.replyWithStatus('table_name', 'entity_id', 'entity description', bot, message)
      .then(() => {
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0][0]).to.equal(message);
        expect(bot.reply.args[0][1]).to.equal('Information for entity description: [entity_id](servicenow-instance.domain/table_name.do?sys_id=entity_id)\n```{\n  "short_description": "description for awesome record"\n}');
      });
  });

  it('should reply with not found if record cannot be found', () => {
    const tableRecordPromise = Promise.reject('Bad things');
    const message = { some: 'message' };

    serviceNowClient.getTableRecord.withArgs('table_name', 'entity_id').returns(tableRecordPromise);

    return statusController.replyWithStatus('table_name', 'entity_id', 'entity description', bot, message)
      .then(() => {
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0][0]).to.equal(message);
        expect(bot.reply.args[0][1]).to.equal('Sorry, I was unable to retrieve the entity description: entity_id. Bad things');
      });
  });
});
