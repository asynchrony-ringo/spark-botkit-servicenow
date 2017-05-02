const sinon = require('sinon');
const expect = require('chai').expect;
const controllerHelper = require('../../src/skillsControllers/controller_helper.js');
const serviceNowClient = require('../../src/service_now_client.js');

describe('controller helper', () => {
  describe('addToCSV', () => {
    it('should return csv with only item if initial csv is undefined', () => {
      const csv = controllerHelper.addToCSV('1234', undefined);
      expect(csv).to.equal('1234');
    });

    it('should return csv with only item if initial csv is empty', () => {
      const csv = controllerHelper.addToCSV('1234', '');
      expect(csv).to.equal('1234');
    });

    it('should return csv with correct items if initial csv contains a single different item', () => {
      const csv = controllerHelper.addToCSV('1234', '2345');
      expect(csv).to.equal('2345,1234');
    });

    it('should return csv with correct items if initial csv contains multiple different items', () => {
      const csv = controllerHelper.addToCSV('1234', '2345,3456');
      expect(csv).to.equal('2345,3456,1234');
    });

    it('should not add a item more than once to the csv', () => {
      const csv = controllerHelper.addToCSV('1234', '1234');
      expect(csv).to.equal('1234');
    });

    it('should add item if item is subset of another item', () => {
      const csv = controllerHelper.addToCSV('123', '1234');
      expect(csv).to.equal('1234,123');
    });

    it('should add item if item is a different type', () => {
      const csv = controllerHelper.addToCSV(123, '1234');
      expect(csv).to.equal('1234,123');
    });
    it('should not add item if item is a different type already in the csv', () => {
      const csv = controllerHelper.addToCSV(123, '123');
      expect(csv).to.equal('123');
    });
  });

  describe('removeFromCSV', () => {
    it('should return empty string if initial csv is undefined', () => {
      const csv = controllerHelper.removeFromCSV('1234', undefined);
      expect(csv).to.equal('');
    });

    it('should return empty string if initial csv is empty', () => {
      const csv = controllerHelper.removeFromCSV('1234', '');
      expect(csv).to.equal('');
    });

    it('should return original csv if initial csv does not contain the item', () => {
      const csv = controllerHelper.removeFromCSV('1234', '2345');
      expect(csv).to.equal('2345');
    });

    it('should return original csv if initial csv is multiple items and does not contain item', () => {
      const csv = controllerHelper.removeFromCSV('1234', '2345,3456');
      expect(csv).to.equal('2345,3456');
    });

    it('should remove item from single item csv', () => {
      const csv = controllerHelper.removeFromCSV('1234', '1234');
      expect(csv).to.equal('');
    });

    it('should not remove item if item is subset of another item', () => {
      const csv = controllerHelper.removeFromCSV('123', '1234');
      expect(csv).to.equal('1234');
    });

    it('should remove item if item is a different type and csv contain item', () => {
      const csv = controllerHelper.removeFromCSV(123, '123,1234');
      expect(csv).to.equal('1234');
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
