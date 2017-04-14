const request = require('request');

const serviceNowClient = {
  getTableRecord: (table, systemId) => new Promise((resolve, reject) => {
    request.get({
      url: `${process.env.serviceNowBaseUrl}/api/now/v1/table/${table}/${systemId}`,
      auth: {
        user: process.env.serviceNowUsername,
        pass: process.env.serviceNowPassword,
      },
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
  .catch(error => Promise.reject(`Error querying table: '${table}'. ${error}`)),
};

module.exports = serviceNowClient;
