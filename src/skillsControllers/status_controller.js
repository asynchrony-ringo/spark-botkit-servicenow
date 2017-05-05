const serviceNowClient = require('../service_now_client.js');
const controllerHelper = require('./controller_helper.js');

const statusController = {

  replyWithStatus: (tableName, id, description, attributes, bot, message) =>
    serviceNowClient.getTableRecord(tableName, id)
      .then((tableRecord) => {
        const serviceNowLink = `[${id}](${process.env.base_url}/${tableName}.do?sys_id=${id})`;
        const response = `Information for ${description}: ${serviceNowLink}\n${controllerHelper.formatMarkdownList(tableRecord.result, attributes)}`;
        bot.reply(message, response);
      })
      .catch((error) => {
        const errorResponse = `Sorry, I was unable to retrieve the ${description}: ${id}. ${error}`;
        bot.reply(message, errorResponse);
      }),
};

module.exports = statusController;
