const assignUserController = require('../skillsControllers/assign_user_controller.js');

const changeRequestAssign = (controller) => {
  controller.hears(['^cr assign[ ]+(.*)[ ]*$'], 'direct_message,direct_mention', (bot, message) => {
    const changeRequestId = message.match[1];
    assignUserController.assignUserToEntity('change_request', changeRequestId, 'Change Request', bot, message);
  });
};

module.exports = changeRequestAssign;
