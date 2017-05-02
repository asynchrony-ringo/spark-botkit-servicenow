const watchController = require('../skillsControllers/watch_controller.js');

const problemWatch = (controller) => {
  controller.hears(['^problem watch[ ]+(.*)[ ]*$'], 'direct_message,direct_mention', (bot, message) => {
    const problemId = message.match[1];

    watchController.watchEntity('problem', problemId, 'Problem', bot, message);
  });
};

module.exports = problemWatch;
