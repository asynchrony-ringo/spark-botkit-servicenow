const createController = require('../skillsControllers/create_controller.js');

const problemCreate = (controller) => {
  controller.hears(['problem create \\[(.*)\\]'], 'direct_message,direct_mention', (bot, message) => {
    const problem = {
      short_description: message.match[1],
      opened_by: message.user,
    };

    createController.replyWithStatus('problem', problem, 'Problem', bot, message);
  });
};

module.exports = problemCreate;
