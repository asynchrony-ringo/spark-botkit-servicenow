const updateController = require('../skillsControllers/update_controller.js');

const entityUpdate = (controller) => {
  controller.hears(['(cr|incident|problem) update ([^ ]*) (.*)'], 'direct_message,direct_mention', (bot, message) => {
    const entityAlias = message.match[1].trim();
    const entityId = message.match[2].trim();
    const updateFields = message.match[3].trim();

    updateController.replyWithUpdate(entityAlias, entityId, updateFields, bot, message);
  });
};


module.exports = entityUpdate;
