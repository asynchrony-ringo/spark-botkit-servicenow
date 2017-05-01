/* eslint consistent-return:off */
const assignUserController = require('../skillsControllers/assign_user_controller.js');

const incidentAssign = (controller) => {
  controller.hears(['incident assign (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const entity = {
      table: 'incident',
      description: 'Incident',
    };

    assignUserController.assignUserToEntity(entity, bot, message);
  });
};

module.exports = incidentAssign;
