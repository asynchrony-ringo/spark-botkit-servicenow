const assignUserController = require('../skillsControllers/assign_user_controller.js');

const problemAssign = (controller) => {
  controller.hears(['problem assign (.*)'], 'direct_message,direct_mention', (bot, message) => {
    assignUserController.assignUserToEntity('problem', 'Problem', bot, message);
  });
};

module.exports = problemAssign;
