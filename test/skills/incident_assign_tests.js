const sinon = require('sinon');
const expect = require('chai').expect;
const incidentAssign = require('../../src/skills/incident_assign.js');
const serviceNowClient = require('../../src/service_now_client.js');

describe('incident assign', () => {
  const controller = { hears: sinon.spy() };

  const incident = {
    result: {
      id: 'incidentId',
      assigned_to: '1234',
    },
  };

  beforeEach(() => {
    incidentAssign(controller);
    process.env.serviceNowBaseUrl = 'servicenow-instance.domain';
  });

  afterEach(() => {
    delete process.env.serviceNowBaseUrl;
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['incident assign (.*)']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let bot;
    let listenerCallback;

    const message = {
      match: 'incident watch someSysId'.match(/incident watch (.*)/),
      user: 'someone@example.com',
    };

    beforeEach(() => {
      bot = { reply: sinon.spy() };
      listenerCallback = controller.hears.args[0][2];

      sinon.stub(serviceNowClient, 'getTableRecord');
      sinon.stub(serviceNowClient, 'getTableRecords');
      sinon.stub(serviceNowClient, 'updateTableRecord');

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
      listenerCallback(bot, message);
      expect(serviceNowClient.getTableRecord.calledOnce).to.be.true;
      expect(serviceNowClient.getTableRecord.args[0][0]).to.equal('incident');
      expect(serviceNowClient.getTableRecord.args[0][1]).to.equal('someSysId');
    });

    it('should reply with not found if record cannot be found', () => {
      const tableRecordPromise = Promise.reject('Bad things');

      serviceNowClient.getTableRecord.withArgs('incident', 'someSysId').returns(tableRecordPromise);

      return listenerCallback(bot, message)
        .then(() => {
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0][0]).to.equal(message);
          expect(bot.reply.args[0][1]).to.equal('Sorry, I was unable to find your incident: someSysId. Bad things');
        });
    });

    describe('when the incident is not found', () => {
      beforeEach(() => {
        const malformedIncident = {};
        const tableRecordPromise = Promise.resolve(malformedIncident);

        serviceNowClient.getTableRecord.returns(tableRecordPromise);
      });

      it('should reply with appropriate error message', () => {
        return listenerCallback(bot, message)
          .then(() => {
            expect(bot.reply.calledOnce).to.be.true;
            expect(bot.reply.args[0][0]).to.deep.equal(message);
            expect(bot.reply.args[0][1]).to.equal('Sorry, I was unable to find that incident.');
          });
      });
    });

    describe('when the incident is found', () => {
      beforeEach(() => {
        const tableRecordPromise = Promise.resolve(incident);

        serviceNowClient.getTableRecord.withArgs('incident', 'someSysId').returns(tableRecordPromise);
      });

      it('getTableRecords should be called', () => {
        return listenerCallback(bot, message)
          .then(() => {
            expect(serviceNowClient.getTableRecords.calledOnce).to.be.true;
            expect(serviceNowClient.getTableRecords.args[0]).to.deep.equal(['sys_user', { sysparm_query: `email=${message.user}` }]);
          });
      });

      describe('when the user is not found', () => {
        beforeEach(() => {
          serviceNowClient.getTableRecords.withArgs('sys_user', { sysparm_query: `email=${message.user}` }).returns(Promise.resolve({ result: [] }));
        });

        it('should reply with appropriate error message', () => {
          return listenerCallback(bot, message)
            .then(() => {
              expect(bot.reply.calledOnce).to.be.true;
              expect(bot.reply.args[0][0]).to.deep.equal(message);
              expect(bot.reply.args[0][1]).to.equal('Sorry, I was unable to find your user account.');
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
          serviceNowClient.getTableRecords.withArgs('sys_user', { sysparm_query: `email=${message.user}` }).returns(Promise.resolve({ result: expectedUsers }));
        });

        it('should call updateTableRecord for incident', () => {
          return listenerCallback(bot, message)
            .then(() => {
              expect(serviceNowClient.updateTableRecord.calledOnce).to.be.true;
              expect(serviceNowClient.updateTableRecord.args[0]).to.deep.equal(['incident', 'someSysId', { assigned_to: '12345' }]);
            });
        });

        describe('when updateTableRecord for incident fails', () => {
          beforeEach(() => {
            const updateTableRecordPromiseReject = Promise.reject('Bad things');

            serviceNowClient.updateTableRecord.returns(updateTableRecordPromiseReject);
          });

          it('should reply an appropriate error message', () => {
            return listenerCallback(bot, message)
              .then(() => {
                expect(bot.reply.calledOnce).to.be.true;
                expect(bot.reply.args[0]).to.deep.equal([message, 'Sorry, I was unable to update the incident: Bad things']);
              });
          });
        });

        describe('when updateTableRecord for incident succeeds', () => {
          beforeEach(() => {
            const updateTableRecordPromiseResolve = Promise.resolve('Good things');

            serviceNowClient.updateTableRecord.returns(updateTableRecordPromiseResolve);
          });

          it('should reply with a success message', () => {
            return listenerCallback(bot, message)
              .then(() => {
                expect(bot.reply.calledOnce).to.be.true;
                expect(bot.reply.args[0]).to.deep.equal([message, `You have been assigned to the incident: [someSysId](${process.env.serviceNowBaseUrl}/incident.do?sys_id=someSysId)`]);
              });
          });
        });
      });
    });
  });
});
