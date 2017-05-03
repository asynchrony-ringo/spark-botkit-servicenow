const watchController = require('../skillsControllers/watch_controller.js');

const incidentUnwatch = (controller) => {
  controller.hears(['incident remove watch (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const incidentId = message.match[1].trim();

    watchController.unwatchEntity('incident', incidentId, 'Incident', bot, message);
  });
};

module.exports = incidentUnwatch;
