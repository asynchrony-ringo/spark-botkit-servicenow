const createController = require('../skillsControllers/create_controller.js');

const incidentCreate = (controller) => {
  controller.hears(['incident create <(.*)> <(.*)>'], 'direct_message,direct_mention', (bot, message) => {
    const incident = {
      short_description: message.match[1],
      category: message.match[2],
      caller_id: message.user,
    };

    createController.replyWithStatus('incident', incident, 'Incident', bot, message);
  });
};

module.exports = incidentCreate;
