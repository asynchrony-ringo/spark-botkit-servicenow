module.exports = function(controller){
  controller.hears(['hello'], 'direct_message,direct_mention', function(bot, message) {
    bot.startConversation(message, function(err, convo) {
      convo.say('world!');
    });
  });
};
