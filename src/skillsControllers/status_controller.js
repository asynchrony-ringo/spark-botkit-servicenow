const serviceNowClient = require('../service_now_client.js');

const statusController = {

  replyWithStatus: (tableName, recordId, description, bot, message) =>
    serviceNowClient.getTableRecord(tableName, recordId)
      .then((tableRecord) => {
        const serviceNowLink = `[${recordId}](${process.env.serviceNowBaseUrl}/${tableName}.do?sys_id=${recordId})`;
        const response = `Information for ${description}: ${serviceNowLink}\n\`\`\`${JSON.stringify(tableRecord, null, 2)}`;
        bot.reply(message, response);
      })
      .catch((error) => {
        const errorResponse = `Sorry, I was unable to retrieve your ${description}: ${recordId}. ${error}`;
        bot.reply(message, errorResponse);
      }),
};

module.exports = statusController;
