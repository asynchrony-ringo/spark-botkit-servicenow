const serviceNowClient = require('../service_now_client.js');

const changeRequestStatus = (controller) => {
  controller.hears(['cr status (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const serviceNowCRId = message.match[1];
    return serviceNowClient.getTableRecord('change_request', serviceNowCRId)
      .then((tableRecord) => {
        const serviceNowLink = `[${serviceNowCRId}](${process.env.serviceNowBaseUrl}/change_request.do?sys_id=${serviceNowCRId})`;
        const response = `Information for change request: ${serviceNowLink}\n\`\`\`${JSON.stringify(tableRecord, null, 2)}`;
        bot.reply(message, response);
      })
      .catch((error) => {
        const errorResponse = `Sorry, I was unable to retrieve your change request: ${serviceNowCRId}. ${error}`;
        bot.reply(message, errorResponse);
      });
  });
};

module.exports = changeRequestStatus;
