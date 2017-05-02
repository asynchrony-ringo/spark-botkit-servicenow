const sinon = require('sinon');
const expect = require('chai').expect;
const serviceNowClient = require('../../src/service_now_client.js');
const createController = require('../../src/skillsControllers/create_controller.js');

describe('create controller', () => {
  let message;
  let record;
  let bot;

  beforeEach(() => {
    record = { id: 'foo', attribute: 'bar' };
    message = { some: 'message' };
    bot = { reply: sinon.spy() };


    sinon.stub(serviceNowClient, 'insertTableRecord').returns(Promise.resolve());
    process.env.serviceNowBaseUrl = 'servicenow-instance.domain';
  });

  afterEach(() => {
    serviceNowClient.insertTableRecord.restore();
    delete process.env.serviceNowBaseUrl;
  });

  it('should create table record', () => {
    createController.replyWithStatus('table_name', record, 'record description', bot, message);

    expect(serviceNowClient.insertTableRecord.calledOnce).to.be.true;
    expect(serviceNowClient.insertTableRecord.args[0][0]).to.equal('table_name');
    expect(serviceNowClient.insertTableRecord.args[0][1]).to.deep.equal(record);
  });

  it('should reply with appropriate error if error when inserting', () => {
    const tableRecordPromise = Promise.reject('Bad things');

    serviceNowClient.insertTableRecord.withArgs('table_name', record).returns(tableRecordPromise);

    return createController.replyWithStatus('table_name', record, 'entity description', bot, message)
      .then(() => {
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0][0]).to.equal(message);
        expect(bot.reply.args[0][1]).to.equal('Sorry, I was unable to create the entity description. Bad things');
      });
  });

  [
    { foo: 'bar' },
    { result: { foo: 'bar' } },
  ].forEach((testCase) => {
    it(`should reply with appropriate error if record is malformed: ${JSON.stringify(testCase)}`, () => {
      const tableRecordPromise = Promise.resolve(testCase);

      serviceNowClient.insertTableRecord.withArgs('table_name', record).returns(tableRecordPromise);

      return createController.replyWithStatus('table_name', record, 'entity description', bot, message)
          .then(() => {
            expect(bot.reply.calledOnce).to.be.true;
            expect(bot.reply.args[0][0]).to.equal(message);
            expect(bot.reply.args[0][1]).to.equal('Sorry, I was unable to create the entity description.');
          });
    });
  });

  it('should reply with change request when record is created successfully', () => {
    const insertResponse = { result: { sys_id: '1234', number: 'NO1234' } };
    const tableRecordPromise = Promise.resolve(insertResponse);

    serviceNowClient.insertTableRecord.withArgs('table_name', record).returns(tableRecordPromise);

    return createController.replyWithStatus('table_name', record, 'entity description', bot, message)
      .then(() => {
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0][0]).to.equal(message);
        expect(bot.reply.args[0][1]).to.equal(`Success, entity description created: [${insertResponse.result.sys_id}](${process.env.serviceNowBaseUrl}/table_name.do?sys_id=${insertResponse.result.sys_id})`);
      });
  });
});
