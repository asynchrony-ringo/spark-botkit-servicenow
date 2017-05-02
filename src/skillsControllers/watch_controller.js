const serviceNowClient = require('../service_now_client.js');
const controllerHelper = require('../skillsControllers/controller_helper.js');

const lookupServiceNowEntity = (tableName, id) => {
  return serviceNowClient.getTableRecord(tableName, id)
    .then((jsonResponse) => {
      if (!jsonResponse.result) {
        return Promise.reject('Unable to find the ServiceNow item.');
      }
      return jsonResponse.result;
    });
};

const updateWatchList = (tableName, id, message, watchListMerge) => {
  return lookupServiceNowEntity(tableName, id)
    .then((entity) => {
      return controllerHelper.lookupServiceNowUser(message.user)
      .then((user) => {
        const watchList = watchListMerge(user.sys_id, entity.watch_list);
        return serviceNowClient.updateTableRecord(tableName, id, { watch_list: watchList });
      });
    });
};

const watchController = {
  watchEntity: (tableName, id, description, bot, message) => {
    return updateWatchList(tableName, id, message, controllerHelper.addToCSV)
      .then(() => `You have been added to the watch list for the ${description}: [${id}](${process.env.serviceNowBaseUrl}/${tableName}.do?sys_id=${id})`)
      .catch(error => `Sorry, I was unable to add you to the watch list for the ${description}: ${id}. ${error}`)
      .then(statusMessage => bot.reply(message, statusMessage));
  },
  unwatchEntity: (tableName, id, description, bot, message) => {
    return updateWatchList(tableName, id, message, controllerHelper.removeFromCSV)
      .then(() => `You have been removed from the watch list for the ${description}: [${id}](${process.env.serviceNowBaseUrl}/${tableName}.do?sys_id=${id})`)
      .catch(error => `Sorry, I was unable to remove you from the watch list for the ${description}: ${id}. ${error}`)
      .then(statusMessage => bot.reply(message, statusMessage));
  },
};

module.exports = watchController;
