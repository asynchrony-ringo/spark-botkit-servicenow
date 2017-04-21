const serviceNowClient = require('../src/service_now_client.js');
const expect = require('chai').expect;
const request = require('request');
const sinon = require('sinon');

describe('service now client', () => {
  const serviceNowUsername = 'service now user';
  const serviceNowPassword = 'service now password';
  const serviceNowBaseUrl = 'service now base url';

  let testObject;

  beforeEach(() => {
    process.env.serviceNowUsername = serviceNowUsername;
    process.env.serviceNowPassword = serviceNowPassword;
    process.env.serviceNowBaseUrl = serviceNowBaseUrl;

    sinon.stub(request, 'get');
    sinon.stub(request, 'post');
    sinon.stub(request, 'patch');

    testObject = serviceNowClient;
  });

  afterEach(() => {
    request.get.restore();
    request.post.restore();
    request.patch.restore();
    delete process.env.serviceNowUsername;
    delete process.env.serviceNowPassword;
    delete process.env.serviceNowBaseUrl;
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
      requestCallback('error! error!', {}, {});

      return result
          .then(() => 'Failed. Expected rejection')
          .catch(error => error)
          .then(error => expect(error).to.equal('Error querying table: \'table\'. error! error!'));
    });

    [201, 300, 400, 500].forEach((status) => {
      it(`should reject if non response status code = ${status}`, () => {
        const result = testObject.getTableRecord('table', 'id');
        const requestCallback = request.get.args[0][1];
        requestCallback(null, { statusCode: status }, {});

        return result
            .then(() => 'Failed. Expected rejection')
            .catch(error => error)
            .then(error => expect(error).to.equal(`Error querying table: 'table'. Unexpected status code: ${status}`));
      });
    });
  });

  describe('insertTableRecord', () => {
    const record = {
      short_description: 'Super cool record.',
      category: 'inquiry',
    };

    it('should make post request once', () => {
      testObject.insertTableRecord('table', record);
      expect(request.post.calledOnce);
    });

    it('should make post request to the correct url', () => {
      testObject.insertTableRecord('sometable', record);
      expect(request.post.args[0][0]).to.have.property('url', `${serviceNowBaseUrl}/api/now/v1/table/sometable`);
    });

    it('should include auth in request', () => {
      testObject.insertTableRecord('table', record);
      expect(request.post.args[0][0]).to.have.property('auth').that.deep.equal({
        user: serviceNowUsername,
        pass: serviceNowPassword,
      });
    });

    it('should include json in request', () => {
      testObject.insertTableRecord('table', record);
      expect(request.post.args[0][0]).to.have.property('json', true);
    });

    it('should have body in request', () => {
      testObject.insertTableRecord('table', record);
      expect(request.post.args[0][0]).to.have.property('body').that.deep.equal(record);
    });

    it('should resolve with the record result on success', () => {
      const result = testObject.insertTableRecord('table', record);
      const requestCallback = request.post.args[0][1];
      requestCallback(null, { statusCode: 201 }, { goodOle: 'json' });

      return result
        .then(response => expect(response).to.deep.equal({ goodOle: 'json' }));
    });

    it('should reject if error', () => {
      const result = testObject.insertTableRecord('table', record);
      const requestCallback = request.post.args[0][1];
      requestCallback('error! error!', {}, {});

      return result
        .then(() => 'Failed. Expected rejection')
        .catch(error => error)
        .then(error => expect(error).to.equal('Error inserting into table: \'table\'. error! error!'));
    });

    [200, 300, 400, 500].forEach((status) => {
      it(`should reject if non response status code = ${status}`, () => {
        const result = testObject.insertTableRecord('table', record);
        const requestCallback = request.post.args[0][1];
        requestCallback(null, { statusCode: status }, {});

        return result
          .then(() => 'Failed. Expected rejection')
          .catch(error => error)
          .then(error => expect(error).to.equal(`Error inserting into table: 'table'. Unexpected status code: ${status}`));
      });
    });
  });

  describe('updateTableRecord', () => {
    const sysId = 123456;
    const changes = {
      short_description: 'Super cool record.',
    };

    it('should make patch request once', () => {
      testObject.updateTableRecord('table', sysId, changes);
      expect(request.patch.calledOnce);
    });

    it('should make patch request to the correct url', () => {
      testObject.updateTableRecord('sometable', sysId, changes);
      expect(request.patch.args[0][0]).to.have.property('url', `${serviceNowBaseUrl}/api/now/v1/table/sometable/${sysId}`);
    });

    it('should include auth in request', () => {
      testObject.updateTableRecord('table', sysId, changes);
      expect(request.patch.args[0][0]).to.have.property('auth').that.deep.equal({
        user: serviceNowUsername,
        pass: serviceNowPassword,
      });
    });

    it('should include json in request', () => {
      testObject.updateTableRecord('table', sysId, changes);
      expect(request.patch.args[0][0]).to.have.property('json', true);
    });

    it('should have body in request', () => {
      testObject.updateTableRecord('table', sysId, changes);
      expect(request.patch.args[0][0]).to.have.property('body').that.deep.equal(changes);
    });

    it('should resolve with the record result on success', () => {
      const result = testObject.updateTableRecord('table', sysId, changes);
      const requestCallback = request.patch.args[0][1];
      requestCallback(null, { statusCode: 200 }, { goodOle: 'json' });

      return result
        .then(response => expect(response).to.deep.equal({ goodOle: 'json' }));
    });

    it('should reject if error', () => {
      const result = testObject.updateTableRecord('tableName', sysId, changes);
      const requestCallback = request.patch.args[0][1];
      requestCallback('error! error!', {}, {});

      return result
        .then(() => 'Failed. Expected rejection')
        .catch(error => error)
        .then(error => expect(error).to.equal(`Error updating tableName: ${sysId}. error! error!`));
    });

    [201, 300, 400, 500].forEach((status) => {
      it(`should reject if non response status code = ${status}`, () => {
        const result = testObject.updateTableRecord('table', sysId, changes);
        const requestCallback = request.patch.args[0][1];
        requestCallback(null, { statusCode: status }, {});

        return result
          .then(() => 'Failed. Expected rejection')
          .catch(error => error)
          .then(error => expect(error).to.equal(`Error updating table: ${sysId}. Unexpected status code: ${status}`));
      });
    });
  });
});
