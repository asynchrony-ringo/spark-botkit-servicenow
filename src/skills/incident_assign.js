/* eslint consistent-return:off */
const serviceNowClient = require('../service_now_client.js');

const incidentAssign = (controller) => {
  controller.hears(['incident assign (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const incidentId = message.match[1];

    return serviceNowClient.getTableRecord('incident', incidentId)
      .then((incidentResponse) => {
        if (incidentResponse.result) {
          return serviceNowClient.getTableRecords('sys_user', { sysparm_query: `email=${message.user}` })
          .then((userResponse) => {
            if (userResponse.result && userResponse.result.length > 0) {
              const user = userResponse.result[0];

              return serviceNowClient.updateTableRecord('incident', incidentId, { assigned_to: user.sys_id })
                .then(() => {
                  bot.reply(message, `You have been assigned to the incident: [${incidentId}](${process.env.serviceNowBaseUrl}/incident.do?sys_id=${incidentId})`);
                })
                .catch((error) => {
                  bot.reply(message, `Sorry, I was unable to update the incident: ${error}`);
                });
            }
            bot.reply(message, 'Sorry, I was unable to find your user account.');
          });
        }
        bot.reply(message, 'Sorry, I was unable to find that incident.');
      })
      .catch((error) => {
        bot.reply(message, `Sorry, I was unable to find your incident: ${incidentId}. ${error}`);
      });
  });
};


module.exports = incidentAssign;
