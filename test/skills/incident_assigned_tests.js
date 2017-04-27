const sinon = require('sinon');
const expect = require('chai').expect;
const incidentAssigned = require('../../src/skills/incident_assigned.js');
const serviceNowClient = require('../../src/service_now_client.js');

describe('incident assigned', () => {
  const controller = { hears: sinon.spy() };

  beforeEach(() => {
    incidentAssigned(controller);
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['incident assigned']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let listenerCallback;
    const message = { user: 'somebody@somewhere.com' };
    beforeEach(() => {
      bot = { reply: sinon.spy() };
      listenerCallback = controller.hears.args[0][2];

      sinon.stub(serviceNowClient, 'getTableRecords').returns({
        then: () => Promise.resolve(),
        catch: () => Promise.reject(),
      });
      process.env.serviceNowBaseUrl = 'service-now-baseurl.wow';
    });

    afterEach(() => {
      serviceNowClient.getTableRecords.restore();
      delete process.env.serviceNowBaseUrl;
    });

    it('should look up incident records assigned to the current user ordered by most recent updated', () => {
      listenerCallback(bot, message);

      expect(serviceNowClient.getTableRecords.calledOnce).to.be.true;
      expect(serviceNowClient.getTableRecords.args[0][0]).to.equal('incident');
      expect(serviceNowClient.getTableRecords.args[0][1]).to.deep.equal({ sysparm_query: `assigned_to.email=${message.user}^ORDERBYDESCsys_updated_on` });
    });

    it('should reply with error message when malformed incidents response', () => {
      const records = {};
      const tableRecordPromise = Promise.resolve(records);
      serviceNowClient.getTableRecords.returns(tableRecordPromise);

      return listenerCallback(bot, message)
        .then(() => {
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0][0]).to.equal(message);
          expect(bot.reply.args[0][1]).to.equal('Sorry, I was unable to retrieve your assigned incidents.');
        });
    });

    it('should reply with incidents when records are found', () => {
      const records = { result: [
        { sys_id: 1234, number: 'INC1234', short_description: 'description for 1234' },
        { sys_id: 5678, number: 'INC5678', short_description: 'description for 5678' },
      ] };
      let expectedResponse = 'Found 2 incidents:\n\n';
      records.result.forEach((record) => {
        expectedResponse += ` * [${record.number}](service-now-baseurl.wow/incident.do?sys_id=${record.sys_id}): ${record.short_description}\n`;
      });

      const tableRecordPromise = Promise.resolve(records);

      serviceNowClient.getTableRecords.returns(tableRecordPromise);

      return listenerCallback(bot, message)
        .then(() => {
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0][0]).to.equal(message);
          expect(bot.reply.args[0][1]).to.equal(expectedResponse);
        });
    });

    it('should reply top 10 incidents when records are found are more than 10', () => {
      const records = { result: [
      ] };

      for (let i = 0; i < 100; i += 1) {
        records.result.push({ sys_id: i, number: `INC${i}`, short_description: `description for ${i}` });
      }


      let expectedResponse = 'Found 100 incidents. Here are the most recently updated 10:\n\n';
      records.result.slice(0, 10).forEach((record) => {
        expectedResponse += ` * [${record.number}](service-now-baseurl.wow/incident.do?sys_id=${record.sys_id}): ${record.short_description}\n`;
      });

      const tableRecordPromise = Promise.resolve(records);

      serviceNowClient.getTableRecords.returns(tableRecordPromise);

      return listenerCallback(bot, message)
        .then(() => {
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0][0]).to.equal(message);
          expect(bot.reply.args[0][1]).to.equal(expectedResponse);
        });
    });

    it('should reply with message if no records are found', () => {
      const tableRecordPromise = Promise.resolve({ result: [] });

      serviceNowClient.getTableRecords.returns(tableRecordPromise);

      return listenerCallback(bot, message)
        .then(() => {
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0][0]).to.equal(message);
          expect(bot.reply.args[0][1]).to.equal('Found no incidents.');
        });
    });

    it('should reply with error message if query fails', () => {
      const tableRecordPromise = Promise.reject('Bad things');

      serviceNowClient.getTableRecords.returns(tableRecordPromise);

      return listenerCallback(bot, message)
        .then(() => {
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0][0]).to.equal(message);
          expect(bot.reply.args[0][1]).to.equal('Sorry, I was unable to retrieve your assigned incidents. Bad things');
        });
    });
  });
});
