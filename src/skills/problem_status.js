const statusController = require('../skillsControllers/status_controller.js');

const problemStatus = (controller) => {
  controller.hears(['problem status (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const problemId = message.match[1].trim();

    statusController.replyWithStatus('problem', problemId, 'Problem', {}, bot, message);
  });
};

module.exports = problemStatus;
