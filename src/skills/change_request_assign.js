const assignUserController = require('../skillsControllers/assign_user_controller.js');

const changeRequestAssign = (controller) => {
  controller.hears(['cr assign (.*)'], 'direct_message,direct_mention', (bot, message) => {
    assignUserController.assignUserToEntity('change_request', 'Change Request', bot, message);
  });
};

module.exports = changeRequestAssign;
