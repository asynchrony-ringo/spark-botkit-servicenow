const assignedController = require('../skillsControllers/assigned_controller.js');

const incidentAssigned = (controller) => {
  controller.hears(['incident assigned'], 'direct_message,direct_mention', (bot, message) => {
    const entity = {
      table: 'incident',
      description: 'Incidents',
    };

    assignedController.getAssignedEntities(entity, bot, message);
  });
};

module.exports = incidentAssigned;
