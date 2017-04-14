const serviceNowClient = require('../service_now_client.js');

const lookupStatus = (controller) => {
  controller.hears(['status (.*)'], 'direct_message,direct_mention', (bot, message) =>
    serviceNowClient.getTableRecord('incident', message.match[1])
      .then(tableRecord => bot.reply(message,
        `Information for incident: ${message.match[1]
       }\n\`\`\`${JSON.stringify(tableRecord, null, 2)}`))
       .catch(error => bot.reply(message,
         `Sorry, I was unable to retrieve your incident: ${message.match[1]}. ${error}`)));
};

module.exports = lookupStatus;
