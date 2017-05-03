const createController = require('../skillsControllers/create_controller.js');

const changeRequestCreate = (controller) => {
  controller.hears(['cr create \\[(.*)\\] \\[(.*)\\]'], 'direct_message,direct_mention', (bot, message) => {
    const changeRequest = {
      short_description: message.match[1],
      category: message.match[2],
      requested_by: message.user,
    };

    createController.replyWithStatus('change_request', changeRequest, 'Change Request', bot, message);
  });
};

module.exports = changeRequestCreate;
