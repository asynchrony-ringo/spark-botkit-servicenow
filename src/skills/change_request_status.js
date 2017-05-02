const statusController = require('../skillsControllers/status_controller.js');

const changeRequestStatus = (controller) => {
  controller.hears(['^cr status (.*)$'], 'direct_message,direct_mention', (bot, message) => {
    const changeRequestId = message.match[1];

    statusController.replyWithStatus('change_request', changeRequestId, 'Change Request', bot, message);
  });
};

module.exports = changeRequestStatus;
