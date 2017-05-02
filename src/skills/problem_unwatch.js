const watchController = require('../skillsControllers/watch_controller.js');

const problemUnWatch = (controller) => {
  controller.hears(['^problem remove watch (.*)$'], 'direct_message,direct_mention', (bot, message) => {
    const problemId = message.match[1];

    watchController.unwatchEntity('problem', problemId, 'Problem', bot, message);
  });
};

module.exports = problemUnWatch;
