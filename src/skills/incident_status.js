const serviceNowClient = require('../service_now_client.js');

const incidentStatus = (controller) => {
  controller.hears(['incident status (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const serviceNowIncidentId = message.match[1];
    return serviceNowClient.getTableRecord('incident', serviceNowIncidentId)
      .then((tableRecord) => {
        const serviceNowLink = `[${serviceNowIncidentId}](${process.env.serviceNowBaseUrl}/incident.do?sys_id=${serviceNowIncidentId})`;
        const response = `Information for incident: ${serviceNowLink}\n\`\`\`${JSON.stringify(tableRecord, null, 2)}`;
        bot.reply(message, response);
      })
      .catch((error) => {
        const errorResponse = `Sorry, I was unable to retrieve your incident: ${serviceNowIncidentId}. ${error}`;
        bot.reply(message, errorResponse);
      });
  });
};

module.exports = incidentStatus;
