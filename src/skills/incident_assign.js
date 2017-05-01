/* eslint consistent-return:off */
const assignUserController = require('../skillsControllers/assign_user_controller.js');

const incidentAssign = (controller) => {
  controller.hears(['incident assign (.*)'], 'direct_message,direct_mention', (bot, message) => {
    assignUserController.assignUserToEntity('incident', 'Incident', bot, message);
  });
};

module.exports = incidentAssign;
