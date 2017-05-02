/* eslint consistent-return:off */
const serviceNowClient = require('../service_now_client.js');
const controllerHelper = require('../skillsControllers/controller_helper.js');

const watchController = {

  watchEntity: (tableName, id, description, bot, message) => {
    return serviceNowClient.getTableRecord(tableName, id)
      .then((jsonResponse) => {
        if (!jsonResponse.result) {
          bot.reply(message, `Sorry, I was unable to find the ${description}: ${id}`);
          return;
        }

        const entity = jsonResponse.result;

        return serviceNowClient.getTableRecords('sys_user', { sysparm_query: `email=${message.user}` })
          .then((userResponse) => {
            if (!userResponse.result || userResponse.result.length === 0) {
              bot.reply(message, 'Sorry, I was unable to find your user account.');
              return;
            }

            const user = userResponse.result[0];
            const watchList = controllerHelper.addUserToWatchList(user.sys_id, entity.watch_list);

            return serviceNowClient.updateTableRecord(tableName, id, { watch_list: watchList })
                .then(() => {
                  bot.reply(message, `You have been added to the watchlist for the ${description}: [${id}](${process.env.serviceNowBaseUrl}/${tableName}.do?sys_id=${id})`);
                })
                .catch((error) => {
                  bot.reply(message, `Sorry, I was unable to update the ${description}: ${error}`);
                });
          });
      })
      .catch((error) => {
        bot.reply(message, `Sorry, I was unable to find the ${description}: ${id}. ${error}`);
      });
  },
};

module.exports = watchController;
