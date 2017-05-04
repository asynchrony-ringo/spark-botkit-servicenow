const request = require('request');
const querystring = require('querystring');

const serviceNowClient = {
  getTableRecord: (table, sysId) => new Promise((resolve, reject) => {
    request.get({
      url: `${process.env.base_url}/api/now/v2/table/${table}/${sysId}`,
      auth: {
        user: process.env.servicenow_username,
        pass: process.env.servicenow_password,
      },
      json: true,
    }, (error, response, json) => {
      if (error) {
        reject(error);
      } else if (response.statusCode >= 400) {
        reject(`Unexpected status code: ${response.statusCode}`);
      }
      resolve(json);
    });
  })
  .catch(error => Promise.reject(`Error querying table: '${table}'. ${error}`)),

  getTableRecords: (table, query) => new Promise((resolve, reject) => {
    request.get({
      url: `${process.env.base_url}/api/now/v2/table/${table}?${querystring.stringify(query)}`,
      auth: {
        user: process.env.servicenow_username,
        pass: process.env.servicenow_password,
      },
      json: true,
    }, (error, response, json) => {
      if (error) {
        reject(error);
      } else if (response.statusCode >= 400) {
        reject(`Unexpected status code: ${response.statusCode}`);
      }
      resolve(json);
    });
  })
  .catch(error => Promise.reject(`Error querying table: '${table}'. ${error}`)),

  insertTableRecord: (table, record) => new Promise((resolve, reject) => {
    request.post({
      url: `${process.env.base_url}/api/now/v2/table/${table}`,
      auth: {
        user: process.env.servicenow_username,
        pass: process.env.servicenow_password,
      },
      body: record,
      json: true,
    }, (error, response, json) => {
      if (error) {
        reject(error);
      } else if (response.statusCode >= 400) {
        reject(`Unexpected status code: ${response.statusCode}`);
      }
      resolve(json);
    });
  })
  .catch(error => Promise.reject(`Error inserting into table: '${table}'. ${error}`)),

  updateTableRecord: (table, sysId, payload) => new Promise((resolve, reject) => {
    request.patch({
      url: `${process.env.base_url}/api/now/v2/table/${table}/${sysId}`,
      auth: {
        user: process.env.servicenow_username,
        pass: process.env.servicenow_password,
      },
      body: payload,
      json: true,
    }, (error, response, json) => {
      if (error) {
        reject(error);
      } else if (response.statusCode !== 200) {
        reject(`Unexpected status code: ${response.statusCode}`);
      }
      resolve(json);
    });
  })
  .catch(error => Promise.reject(`Error updating ${table}: ${sysId}. ${error}`)),

};

module.exports = serviceNowClient;
