const watchController = require('../skillsControllers/watch_controller.js');

const changeRequestWatch = (controller) => {
  controller.hears(['cr watch (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const changeRequestId = message.match[1];

    watchController.watchEntity('change_request', 'Change Request', changeRequestId, bot, message);
  });
};

module.exports = changeRequestWatch;
