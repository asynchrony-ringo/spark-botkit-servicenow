const statusController = require('../skillsControllers/status_controller.js');

const problemStatus = (controller) => {
  const table = 'problem';
  const description = 'Problem';
  const attributes = {
    number: 'Number',
    short_description: 'Description',
    sys_created_on: 'Created',
    sys_updated_on: 'Last Updated',
    active: 'Active',
  };
  controller.hears(['problem status (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const problemId = message.match[1].trim();

    statusController.replyWithStatus(table, problemId, description, attributes, bot, message);
  });
};

module.exports = problemStatus;
