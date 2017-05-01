/* eslint consistent-return:off */
const serviceNowClient = require('../service_now_client.js');

const assignUserController = {
  assignUserToEntity: (entity, bot, message) => {
    const entityId = message.match[1];

    return serviceNowClient.getTableRecords('sys_user', { sysparm_query: `email=${message.user}` })
      .then((userResponse) => {
        if (userResponse.result && userResponse.result.length > 0) {
          const user = userResponse.result[0];

          return serviceNowClient
            .updateTableRecord(entity.table, entityId, { assigned_to: user.sys_id })
            .then(() => {
              bot.reply(message, `You have been assigned to the ${entity.description}: [${entityId}](${process.env.serviceNowBaseUrl}/incident.do?sys_id=${entityId})`);
            })
            .catch((error) => {
              bot.reply(message, `Sorry, I was unable to update the ${entity.description}: ${error}`);
            });
        }
        bot.reply(message, 'Sorry, I was unable to find your user account.');
      })
      .catch(() => {
        bot.reply(message, 'Sorry, I was unable to find your user account.');
      });
  },
};

module.exports = assignUserController;
