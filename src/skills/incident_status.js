const statusController = require('../skillsControllers/status_controller.js');

const incidentStatus = (controller) => {
  const table = 'incident';
  const description = 'Incident';
  const attributes = {
    number: 'Number',
    short_description: 'Description',
    category: 'Category',
    subcategory: 'Sub Category',
    sys_created_on: 'Created',
    sys_updated_on: 'Last Updated',
    active: 'Active',
  };
  controller.hears(['incident status (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const incidentId = message.match[1].trim();

    statusController.replyWithStatus(table, incidentId, description, attributes, bot, message);
  });
};

module.exports = incidentStatus;
