const helloWorld = (controller) => {
  controller.hears(['hello'], 'direct_message,direct_mention', (bot, message) => {
    bot.startConversation(message, (err, convo) => {
      convo.say('world!');
    });
  });
};

module.exports = helloWorld;
