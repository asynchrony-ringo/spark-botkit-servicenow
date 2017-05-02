const serviceNowClient = require('../service_now_client.js');

const controllerHelper = {
  addToCSV: (item, watchList) => {
    const itemString = item.toString();
    const watchListArray = watchList ? watchList.split(',') : [];
    if (watchListArray.indexOf(itemString) === -1) {
      watchListArray.push(itemString);
    }
    return watchListArray.join(',');
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
