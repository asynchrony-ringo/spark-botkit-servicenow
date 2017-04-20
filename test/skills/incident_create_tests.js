const sinon = require('sinon');
const expect = require('chai').expect;
const incidentCreate = require('../../src/skills/incident_create.js');
const serviceNowClient = require('../../src/service_now_client.js');

describe('incident create', () => {
  const controller = { hears: sinon.spy() };

  beforeEach(() => {
    incidentCreate(controller);
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['incident create <(.*)> <(.*)>']);
    expect(controller.hears.args[0][1]).to.equal('direct_message, direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let listenerCallback;
    const incident = {
      short_description: 'Some description.',
      category: 'inquiry',
      caller_id: 'someone@example.com',
    };
    const message = {
      match: 'incident create <Some description.> <inquiry>'.match(/incident create <(.*)> <(.*)>/),
      user: 'someone@example.com',
    };
    beforeEach(() => {
      bot = { reply: sinon.spy() };
      listenerCallback = controller.hears.args[0][2];

      sinon.stub(serviceNowClient, 'insertTableRecord').returns({
        then: () => Promise.resolve(),
        catch: () => Promise.reject(),
      });
    });

    afterEach(() => {
      serviceNowClient.insertTableRecord.restore();
    });

    it('should insert incident record based on supplied params', () => {
      listenerCallback(bot, message);

      expect(serviceNowClient.insertTableRecord.calledOnce).to.be.true;
      expect(serviceNowClient.insertTableRecord.args[0][0]).to.equal('incident');
      expect(serviceNowClient.insertTableRecord.args[0][1]).to.deep.equal(incident);
    });

    it('should reply with incident when record is created', () => {
      process.env.serviceNowBaseUrl = 'yo.service-now.com';
      const insertResponse = { result: { sys_id: '1234', number: 'INC1234' } };
      const tableRecordPromise = Promise.resolve(insertResponse);

      serviceNowClient.insertTableRecord.withArgs('incident', incident).returns(tableRecordPromise);

      return listenerCallback(bot, message)
        .then(() => {
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0][0]).to.equal(message);
          expect(bot.reply.args[0][1]).to.equal(`Success: [${insertResponse.result.number}](${process.env.serviceNowBaseUrl}/incident.do?sys_id=${insertResponse.result.sys_id})`);
        });
    });

    it('should reply with not created if incident cannot be created', () => {
      const tableRecordPromise = Promise.reject('Bad things');

      serviceNowClient.insertTableRecord.withArgs('incident', incident).returns(tableRecordPromise);

      return listenerCallback(bot, message)
        .then(() => {
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0][0]).to.equal(message);
          expect(bot.reply.args[0][1]).to.equal('Sorry, I was unable to create your incident: Bad things');
        });
    });
  });
});
