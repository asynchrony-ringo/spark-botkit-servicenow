const serviceNowClient = require('../service_now_client.js');

const problemStatus = (controller) => {
  controller.hears(['problem status (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const serviceNowProblemId = message.match[1];
    return serviceNowClient.getTableRecord('problem', serviceNowProblemId)
      .then((tableRecord) => {
        const serviceNowLink = `[${serviceNowProblemId}](${process.env.serviceNowBaseUrl}/problem.do?sys_id=${serviceNowProblemId})`;
        const response = `Information for problem: ${serviceNowLink}\n\`\`\`${JSON.stringify(tableRecord, null, 2)}`;
        bot.reply(message, response);
      })
      .catch((error) => {
        const errorResponse = `Sorry, I was unable to retrieve your problem: ${serviceNowProblemId}. ${error}`;
        bot.reply(message, errorResponse);
      });
  });
};

module.exports = problemStatus;
