const sinon = require('sinon');
const expect = require('chai').expect;
const controllerHelper = require('../../src/skillsControllers/controller_helper.js');
const serviceNowClient = require('../../src/service_now_client.js');

describe('controller helper', () => {
  describe('addUserToWatchList', () => {
    it('should return watch list with only user id if initial watch list is undefined', () => {
      const watchList = controllerHelper.addUserToWatchList('1234', undefined);
      expect(watchList).to.equal('1234');
    });

    it('should return watch list with only user id if initial watch list is empty', () => {
      const watchList = controllerHelper.addUserToWatchList('1234', '');
      expect(watchList).to.equal('1234');
    });

    it('should return watch list with correct users if initial watch list contains a single different user', () => {
      const watchList = controllerHelper.addUserToWatchList('1234', '2345');
      expect(watchList).to.equal('2345,1234');
    });

    it('should return watch list with correct users if initial watch list contains multiple different users', () => {
      const watchList = controllerHelper.addUserToWatchList('1234', '2345,3456');
      expect(watchList).to.equal('2345,3456,1234');
    });

    it('should not add a user more than once to the watch list', () => {
      const watchList = controllerHelper.addUserToWatchList('1234', '1234');
      expect(watchList).to.equal('1234');
    });

    it('should add user if user id is subset of another user id', () => {
      const watchList = controllerHelper.addUserToWatchList('123', '1234');
      expect(watchList).to.equal('1234,123');
    });
  });

  describe('lookupServiceNowUser', () => {
    beforeEach(() => {
      sinon.stub(serviceNowClient, 'getTableRecords');
    });

    afterEach(() => {
      serviceNowClient.getTableRecords.restore();
    });

    it('should call lookupServiceNowUser', () => {
      serviceNowClient.getTableRecords.returns(Promise.resolve());
      controllerHelper.lookupServiceNowUser('agoodemail');
      expect(serviceNowClient.getTableRecords.calledOnce);
      expect(serviceNowClient.getTableRecords.args[0]).to.deep.equal(['sys_user', { sysparm_query: 'email=agoodemail' }]);
    });


    [
      undefined,
      'foo',
      {},
      [],
      { result: [] },
      { foo: 'bar' },
    ].forEach((userRecords) => {
      it(`should reject with error message when user records = ${userRecords}`, () => {
        serviceNowClient.getTableRecords.returns(Promise.resolve(userRecords));
        return controllerHelper.lookupServiceNowUser('email')
          .then(success => Promise.reject(`Error, expected rejection but got: ${success}`))
          .catch((error) => {
            expect(error).to.equal('No ServiceNow user account found.');
          });
      });
    });

    it('should reject if getTableRecords rejects', () => {
      serviceNowClient.getTableRecords.returns(Promise.reject('some bad error'));
      return controllerHelper.lookupServiceNowUser('email')
        .then(success => Promise.reject(`Error, expected rejection but got: ${success}`))
        .catch((error) => {
          expect(error).to.equal('some bad error');
        });
    });

    it('should resolve with user when user record found', () => {
      serviceNowClient.getTableRecords.returns(Promise.resolve({ result: [{ sys_id: '1234' }] }));
      return controllerHelper.lookupServiceNowUser('email')
        .then((user) => {
          expect(user).to.deep.equal({ sys_id: '1234' });
        });
    });
  });
});
