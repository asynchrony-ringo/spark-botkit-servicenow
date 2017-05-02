const serviceNowClient = require('../service_now_client.js');

const controllerHelper = {
  addUserToWatchList: (userId, watchList) => {
    const watchListArray = watchList ? watchList.split(',') : [];
    if (watchListArray.indexOf(userId) === -1) {
      watchListArray.push(userId);
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
