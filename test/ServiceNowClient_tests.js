const ServiceNow = require('../src/ServiceNowClient.js');
const expect = require('chai').expect;
const request = require('request');
const sinon = require('sinon');

describe('service now client', () => {
  const serviceNowUsername = 'service now user';
  const serviceNowPassword = 'service now password';
  const serviceNowBaseUrl = 'service now base url';

  let testObject;


  describe('without process.env set', () => {
    [
      { error: 'serviceNowUsername not set in .env file', env: { serviceNowBaseUrl, serviceNowPassword } },
      { error: 'serviceNowBaseUrl not set in .env file', env: { serviceNowPassword, serviceNowUsername } },
      { error: 'serviceNowPassword not set in .env file', env: { serviceNowUsername, serviceNowBaseUrl } },
    ].forEach(({ error, env }) => {
      it(`should throw error "${error}"`, () => {
        Object.keys(env).forEach((k) => { process.env[k] = env[k]; });
        expect(() => new ServiceNow()).to.throw(error);
        Object.keys(env).forEach(k => delete process.env[k]);
      });
    });
  });

  describe('with process.env set', () => {
    beforeEach(() => {
      process.env.serviceNowUsername = serviceNowUsername;
      process.env.serviceNowPassword = serviceNowPassword;
      process.env.serviceNowBaseUrl = serviceNowBaseUrl;

      sinon.stub(request, 'get');

      testObject = new ServiceNow();
    });

    afterEach(() => {
      request.get.restore();
      delete process.env.serviceNowUsername;
      delete process.env.serviceNowPassword;
      delete process.env.serviceNowBaseUrl;
    });

    it('should look up properties from process.env', () => {
      expect(testObject.username).to.equal(serviceNowUsername);
      expect(testObject.password).to.equal(serviceNowPassword);
      expect(testObject.baseUrl).to.equal(serviceNowBaseUrl);
    });

    describe('getTableRecord', () => {
      it('should make get request once', () => {
        testObject.getTableRecord('table', 'id');
        expect(request.get.calledOnce);
      });

      it('should make get request to the correct url', () => {
        testObject.getTableRecord('sometable', 'some sys id');
        expect(request.get.args[0][0]).to.have.property('url', `${serviceNowBaseUrl}/api/now/v1/table/sometable/some sys id`);
      });

      it('should include auth in request', () => {
        testObject.getTableRecord('table', 'id');
        expect(request.get.args[0][0]).to.have.property('auth').that.deep.equal({
          user: serviceNowUsername,
          pass: serviceNowPassword,
        });
      });

      it('should include json in request', () => {
        testObject.getTableRecord('table', 'id');
        expect(request.get.args[0][0]).to.have.property('json', true);
      });


      it('should resolve with the record result on success', () => {
        const result = testObject.getTableRecord('table', 'id');
        const requestCallback = request.get.args[0][1];
        requestCallback(null, { statusCode: 200 }, { goodOle: 'json' });

        return result
          .then(response => expect(response).to.deep.equal({ goodOle: 'json' }));
      });

      it('should reject if error', () => {
        const result = testObject.getTableRecord('table', 'id');
        const requestCallback = request.get.args[0][1];
        requestCallback('error! error!', {}, { });

        return result
          .then(() => 'Failed. Expected rejection')
          .catch(error => error)
          .then(error => expect(error).to.equal('Error querying table: \'table\'. error! error!'));
      });

      it('should reject if non 200 status', () => {
        const result = testObject.getTableRecord('table', 'id');
        const requestCallback = request.get.args[0][1];
        requestCallback(null, { statusCode: 500 }, {});

        return result
          .then(() => 'Failed. Expected rejection')
          .catch(error => error)
          .then(error => expect(error).to.equal('Error querying table: \'table\'. Unexpected status code: 500'));
      });
    });
  });
});
