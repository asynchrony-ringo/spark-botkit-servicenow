const request = require('request');

class ServiceNow {
  constructor() {
    this.username = process.env.serviceNowUsername;
    this.password = process.env.serviceNowPassword;
    this.baseUrl = process.env.serviceNowBaseUrl;

    if (!this.username) throw new Error('serviceNowUsername not set in .env file');
    if (!this.password) throw new Error('serviceNowPassword not set in .env file');
    if (!this.baseUrl) throw new Error('serviceNowBaseUrl not set in .env file');
  }

  getTableRecord(table, systemId) {
    return new Promise((resolve, reject) => {
      request.get({
        url: `${this.baseUrl}/api/now/v1/table/${table}/${systemId}`,
        auth: {
          user: this.username,
          pass: this.password,
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
    .catch(error => Promise.reject(`Error querying table: '${table}'. ${error}`));
  }
}


module.exports = ServiceNow;
