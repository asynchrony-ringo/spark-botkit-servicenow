/* eslint consistent-return:off */
const assignUserController = require('../skillsControllers/assign_user_controller.js');

const incidentAssign = (controller) => {
  controller.hears(['incident assign (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const incidentId = message.match[1].trim();
    assignUserController.assignUserToEntity('incident', incidentId, 'Incident', bot, message);
  });
};

module.exports = incidentAssign;
