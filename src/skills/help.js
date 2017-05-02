const fs = require('fs');

const help = (controller) => {
  controller.hears(['^help$'], 'direct_message,direct_mention', (bot, message) => {
    fs.readFile('docs/help.md', 'utf-8', (err, helpResponse) => {
      bot.reply(message, helpResponse);
    });
  });
};

module.exports = help;
