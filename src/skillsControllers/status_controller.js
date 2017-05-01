const serviceNowClient = require('../service_now_client.js');

const statusController = {

  replyWithStatus: (tableName, id, description, bot, message) =>
    serviceNowClient.getTableRecord(tableName, id)
      .then((tableRecord) => {
        const serviceNowLink = `[${id}](${process.env.serviceNowBaseUrl}/${tableName}.do?sys_id=${id})`;
        const response = `Information for ${description}: ${serviceNowLink}\n\`\`\`${JSON.stringify(tableRecord, null, 2)}`;
        bot.reply(message, response);
      })
      .catch((error) => {
        const errorResponse = `Sorry, I was unable to retrieve the ${description}: ${id}. ${error}`;
        bot.reply(message, errorResponse);
      }),
};

module.exports = statusController;
