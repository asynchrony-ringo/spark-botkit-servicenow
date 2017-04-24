const serviceNowClient = require('../service_now_client.js');

const incidentAssigned = (controller) => {
  controller.hears(['incident assigned'], 'direct_message,direct_mention', (bot, message) =>
    serviceNowClient.getTableRecords('incident', { sysparm_query: `assigned_to.email=${message.user}` })
    .then((jsonResult) => {
      const tableRecords = jsonResult.result;

      if (tableRecords.length > 0) {
        let response = `Found ${tableRecords.length} incidents:\n\n`;
        tableRecords.forEach((record) => {
          const serviceNowLink = `[${record.number}](${process.env.serviceNowBaseUrl}/incident.do?sys_id=${record.sys_id})`;
          response += ` * ${serviceNowLink}: ${record.short_description}\n`;
        });
        bot.reply(message, response);
      } else {
        bot.reply(message, 'Found 0 incidents.');
      }
    })
    .catch((error) => {
      const errorResponse = `Sorry, I was unable to retrieve your assigned incidents. ${error}`;
      bot.reply(message, errorResponse);
    }));
};

module.exports = incidentAssigned;
