const sinon = require('sinon');
const expect = require('chai').expect;
const changeRequestStatus = require('../../src/skills/change_request_status.js');
const serviceNowClient = require('../../src/service_now_client.js');

describe('change request status', () => {
  const controller = { hears: sinon.spy() };

  beforeEach(() => {
    changeRequestStatus(controller);
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['cr status (.*)']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let listenerCallback;
    beforeEach(() => {
      bot = { reply: sinon.spy() };
      listenerCallback = controller.hears.args[0][2];

      sinon.stub(serviceNowClient, 'getTableRecord').returns({
        then: () => Promise.resolve(),
        catch: () => Promise.reject(),
      });
    });

    afterEach(() => {
      serviceNowClient.getTableRecord.restore();
    });

    it('should look up change request record based on user supplied id', () => {
      const message = { match: 'cr status someSysId'.match(/status (.*)/) };

      listenerCallback(bot, message);

      expect(serviceNowClient.getTableRecord.calledOnce).to.be.true;
      expect(serviceNowClient.getTableRecord.args[0][0]).to.equal('change_request');
      expect(serviceNowClient.getTableRecord.args[0][1]).to.equal('someSysId');
    });

    it('should reply with change request when record is found', () => {
      process.env.serviceNowBaseUrl = 'yo.service-now.com';
      const tableRecordPromise = Promise.resolve({ short_description: 'description for record 1234' });
      const message = { match: 'cr status 1234'.match(/cr status (.*)/) };

      serviceNowClient.getTableRecord.withArgs('change_request', '1234').returns(tableRecordPromise);

      return listenerCallback(bot, message)
        .then(() => {
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0][0]).to.equal(message);
          expect(bot.reply.args[0][1]).to.equal('Information for change request: [1234](yo.service-now.com/change_request.do?sys_id=1234)\n```{\n  "short_description": "description for record 1234"\n}');
        });
    });

    it('should reply with not found if change request cannot be found', () => {
      const tableRecordPromise = Promise.reject('Bad things');
      const message = { match: 'cr status asdasd'.match(/cr status (.*)/) };

      serviceNowClient.getTableRecord.withArgs('change_request', 'asdasd').returns(tableRecordPromise);

      return listenerCallback(bot, message)
        .then(() => {
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0][0]).to.equal(message);
          expect(bot.reply.args[0][1]).to.equal('Sorry, I was unable to retrieve your change request: asdasd. Bad things');
        });
    });
  });
});
