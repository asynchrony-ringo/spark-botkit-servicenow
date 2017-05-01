const assignedController = require('../skillsControllers/assigned_controller.js');

const problemAssigned = (controller) => {
  controller.hears(['problem assigned'], 'direct_message,direct_mention', (bot, message) => {
    assignedController.getAssignedEntities('problem', 'Problems', bot, message);
  });
};

module.exports = problemAssigned;
