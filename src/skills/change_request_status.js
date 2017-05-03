const statusController = require('../skillsControllers/status_controller.js');


const changeRequestStatus = (controller) => {
  const table = 'change_request';
  const description = 'Change Request';
  const attributes = {
    number: 'Number',
    short_description: 'Short Description',
    category: 'Category',
    phase: 'Phase',
    sys_created_on: 'Created',
    sys_updated_on: 'Last Updated',
    active: 'Active',
  };

  controller.hears(['cr status (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const changeRequestId = message.match[1].trim();

    statusController.replyWithStatus(table, changeRequestId, description, attributes, bot, message);
  });
};

module.exports = changeRequestStatus;
