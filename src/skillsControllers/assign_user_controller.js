const serviceNowClient = require('../service_now_client.js');

const assignUserController = {
  assignUserToEntity: (tableName, id, description, bot, message) => {
    return serviceNowClient.getTableRecords('sys_user', { sysparm_query: `email=${message.user}` })
      .then((userResponse) => {
        if (userResponse.result && userResponse.result.length > 0) {
          const user = userResponse.result[0];

          return serviceNowClient
            .updateTableRecord(tableName, id, { assigned_to: user.sys_id })
            .then(() => {
              bot.reply(message, `You have been assigned to the ${description}: [${id}](${process.env.serviceNowBaseUrl}/${tableName}.do?sys_id=${id})`);
            })
            .catch((error) => {
              bot.reply(message, `Sorry, I was unable to assign you to the ${description}. ${error}`);
            });
        }
        bot.reply(message, 'Sorry, I was unable to find your user account.');
        return Promise.resolve();
      })
      .catch(() => {
        bot.reply(message, 'Sorry, I was unable to find your user account.');
      });
  },
};

module.exports = assignUserController;
