const assignedController = require('../skillsControllers/assigned_controller.js');

const incidentAssigned = (controller) => {
  controller.hears(['^incident assigned$'], 'direct_message,direct_mention', (bot, message) => {
    assignedController.getAssignedEntities('incident', 'Incidents', bot, message);
  });
};

module.exports = incidentAssigned;
