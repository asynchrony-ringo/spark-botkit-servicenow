const watchController = require('../skillsControllers/watch_controller.js');

const incidentWatch = (controller) => {
  controller.hears(['incident watch (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const incidentId = message.match[1];

    watchController.watchEntity('incident', 'Incident', incidentId, bot, message);
  });
};

module.exports = incidentWatch;
