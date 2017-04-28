const serviceNowClient = require('../service_now_client.js');

const createController = {

  replyWithStatus: (tableName, record, description, bot, message) =>
    serviceNowClient.insertTableRecord(tableName, record)
      .then((response) => {
        if (!response.result || !response.result.sys_id) {
          bot.reply(message, `Sorry, I was unable to create your ${description}.`);
          return;
        }

        const recordId = response.result.sys_id;
        const serviceNowLink = `[${recordId}](${process.env.serviceNowBaseUrl}/${tableName}.do?sys_id=${recordId})`;
        bot.reply(message, `Success: ${serviceNowLink}`);
      })
      .catch((error) => {
        bot.reply(message, `Sorry, I was unable to create your ${description}. ${error}`);
      }),
};

module.exports = createController;
