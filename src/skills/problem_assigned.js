const assignedController = require('../skillsControllers/assigned_controller.js');

const problemAssigned = (controller) => {
  controller.hears(['problem assigned'], 'direct_message,direct_mention', (bot, message) => {
    const entity = {
      table: 'problem',
      description: 'Problems',
    };

    assignedController.getAssignedEntities(entity, bot, message);
  });
};

module.exports = problemAssigned;
