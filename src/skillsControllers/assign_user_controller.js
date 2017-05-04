const serviceNowClient = require('../service_now_client.js');
const controllerHelper = require('./controller_helper.js');

const assignUserController = {
  assignUserToEntity: (tableName, id, description, bot, message) => {
    return controllerHelper.lookupServiceNowUser(message.user)
    .then(user => serviceNowClient.updateTableRecord(tableName, id, { assigned_to: user.sys_id }))
    .then(() => `You have been assigned to the ${description}: [${id}](${process.env.base_url}/${tableName}.do?sys_id=${id})`)
    .catch(error => `Sorry, I was unable to assign you to the ${description}. ${error}`)
    .then(statusMessage => bot.reply(message, statusMessage));
  },
};

module.exports = assignUserController;
