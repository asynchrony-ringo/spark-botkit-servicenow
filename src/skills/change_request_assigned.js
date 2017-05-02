const assignedController = require('../skillsControllers/assigned_controller.js');

const changeRequestAssigned = (controller) => {
  controller.hears(['^cr assigned$'], 'direct_message,direct_mention', (bot, message) => {
    assignedController.getAssignedEntities('change_request', 'Change Requests', bot, message);
  });
};

module.exports = changeRequestAssigned;
