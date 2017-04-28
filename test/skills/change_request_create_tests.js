const sinon = require('sinon');
const expect = require('chai').expect;
const changeRequestCreate = require('../../src/skills/change_request_create.js');
const serviceNowClient = require('../../src/service_now_client.js');

describe('change request create', () => {
  const controller = { hears: sinon.spy() };

  beforeEach(() => {
    changeRequestCreate(controller);
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['cr create <(.*)> <(.*)>']);
    expect(controller.hears.args[0][1]).to.equal('direct_message, direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let listenerCallback;
    const changeRequest = {
      short_description: 'description',
      category: 'category',
    };
    const message = {
      match: 'cr create <description> <category>'.match(/cr create <(.*)> <(.*)>/),
      user: 'someone@example.com',
    };

    beforeEach(() => {
      bot = { reply: sinon.spy() };
      listenerCallback = controller.hears.args[0][2];

      sinon.stub(serviceNowClient, 'insertTableRecord').returns({
        then: () => Promise.resolve(),
        catch: () => Promise.reject(),
      });
      process.env.serviceNowBaseUrl = 'yo.service-now.com';
    });

    afterEach(() => {
      serviceNowClient.insertTableRecord.restore();
      delete process.env.serviceNowBaseUrl;
    });


    it('should insert change request record based on supplied params', () => {
      listenerCallback(bot, message);

      expect(serviceNowClient.insertTableRecord.calledOnce).to.be.true;
      expect(serviceNowClient.insertTableRecord.args[0][0]).to.equal('change_request');
      expect(serviceNowClient.insertTableRecord.args[0][1]).to.deep.equal(changeRequest);
    });

    it('should reply with change request when record is created', () => {
      const insertResponse = { result: { sys_id: '1234', number: 'CHC1234' } };
      const tableRecordPromise = Promise.resolve(insertResponse);

      serviceNowClient.insertTableRecord.withArgs('change_request', changeRequest).returns(tableRecordPromise);

      return listenerCallback(bot, message)
        .then(() => {
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0][0]).to.equal(message);
          expect(bot.reply.args[0][1]).to.equal(`Success: [${insertResponse.result.number}](${process.env.serviceNowBaseUrl}/change_request.do?sys_id=${insertResponse.result.sys_id})`);
        });
    });

    it('should reply with not created if incident cannot be created', () => {
      const tableRecordPromise = Promise.reject('Bad things');

      serviceNowClient.insertTableRecord.withArgs('change_request', changeRequest).returns(tableRecordPromise);

      return listenerCallback(bot, message)
        .then(() => {
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0][0]).to.equal(message);
          expect(bot.reply.args[0][1]).to.equal('Sorry, I was unable to create your change request: Bad things');
        });
    });
  });
});
