const statusController = require('../skillsControllers/status_controller.js');

const incidentStatus = (controller) => {
  controller.hears(['incident status (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const incidentId = message.match[1].trim();

    statusController.replyWithStatus('incident', incidentId, 'Incident', {}, bot, message);
  });
};

module.exports = incidentStatus;
