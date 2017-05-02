const assignUserController = require('../skillsControllers/assign_user_controller.js');

const problemAssign = (controller) => {
  controller.hears(['problem assign (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const problemId = message.match[1];
    assignUserController.assignUserToEntity('problem', problemId, 'Problem', bot, message);
  });
};

module.exports = problemAssign;
