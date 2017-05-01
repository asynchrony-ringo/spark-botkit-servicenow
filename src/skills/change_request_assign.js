const assignUserController = require('../skillsControllers/assign_user_controller.js');

const changeRequestAssign = (controller) => {
  controller.hears(['cr assign (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const entity = {
      table: 'change_request',
      description: 'Change Request',
    };

    assignUserController.assignUserToEntity(entity, bot, message);
  });
};

module.exports = changeRequestAssign;
