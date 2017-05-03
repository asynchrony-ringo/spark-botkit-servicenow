const watchController = require('../skillsControllers/watch_controller.js');

const incidentWatch = (controller) => {
  controller.hears(['incident watch (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const incidentId = message.match[1].trim();

    watchController.watchEntity('incident', incidentId, 'Incident', bot, message);
  });
};

module.exports = incidentWatch;
