const serviceNowClient = require('../service_now_client.js');

const changeRequestCreate = (controller) => {
  controller.hears(['cr create <(.*)> <(.*)>'], 'direct_message, direct_mention', (bot, message) => {
    const changeRequest = {
      short_description: message.match[1],
      category: message.match[2],
    };

    return serviceNowClient.insertTableRecord('change_request', changeRequest)
      .then((response) => {
        const responseString = `Success: [${response.result.number}](${process.env.serviceNowBaseUrl}/change_request.do?sys_id=${response.result.sys_id})`;
        bot.reply(message, responseString);
      })
      .catch((error) => {
        bot.reply(message, `Sorry, I was unable to create your change request: ${error}`);
      });
  });
};

module.exports = changeRequestCreate;
