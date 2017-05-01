const assignedController = require('../skillsControllers/assigned_controller.js');

const changeRequestAssigned = (controller) => {
  controller.hears(['cr assigned'], 'direct_message,direct_mention', (bot, message) => {
    const entity = {
      table: 'change_request',
      description: 'Change Requests',
    };

    assignedController.getAssignedEntities(entity, bot, message);
  });
};

module.exports = changeRequestAssigned;
