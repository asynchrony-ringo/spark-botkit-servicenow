const serviceNowClient = require('../service_now_client.js');

const controllerHelper = {
  addToCSV: (item, csv) => {
    const itemString = item.toString();
    const splitArray = csv ? csv.split(',') : [];
    if (splitArray.indexOf(itemString) === -1) {
      splitArray.push(itemString);
    }
    return splitArray.join(',');
  },
  removeFromCSV: (item, csv) => {
    const itemString = item.toString();
    const splitArray = csv ? csv.split(',') : [];
    const index = splitArray.indexOf(itemString);
    if (index !== -1) {
      splitArray.splice(index, 1);
    }
    return splitArray.join(',');
  },
  lookupServiceNowUser: (userEmail) => {
    return serviceNowClient.getTableRecords('sys_user', { sysparm_query: `email=${userEmail}` })
      .then((userResponse) => {
        if (!userResponse || !userResponse.result || userResponse.result.length === 0) {
          return Promise.reject('No ServiceNow user account found.');
        }
        return userResponse.result[0];
      });
  },
};

module.exports = controllerHelper;
