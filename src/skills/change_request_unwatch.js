const watchController = require('../skillsControllers/watch_controller.js');

const changeRequestUnwatch = (controller) => {
  controller.hears(['cr remove watch (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const changeRequestId = message.match[1].trim();

    watchController.unwatchEntity('change_request', changeRequestId, 'Change Request', bot, message);
  });
};


module.exports = changeRequestUnwatch;
