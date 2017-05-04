const updateAlertDifferenceGatherer = require('./update_alert_difference_gatherer.js');

const updateAlertController = {
  messageCaller: (newObj, oldObj, controller) => {
    if (newObj.alert_email) {
      const bot = controller.spawn({});

      bot.startPrivateConversation({ user: newObj.alert_email }, (error, conversation) => {
        if (error) {
          console.log(`Error starting conversation with ${newObj.alert_email}: `, error);
          return;
        }

        const tableName = newObj.type.replace(/\s/, '_').toLowerCase();
        const diff = updateAlertDifferenceGatherer.formatMessage(newObj, oldObj);
        conversation.say(`The ${newObj.type} [${newObj.sys_id}](${process.env.base_url}/${tableName}.do?sys_id=${newObj.sys_id}) has been updated!\n${diff}`);
      });
    }
  },

  isValid: (newObj, oldObj) => {
    if (newObj && oldObj
      && newObj.type && oldObj.type && newObj.type === oldObj.type
      && newObj.sys_id && oldObj.sys_id && newObj.sys_id === oldObj.sys_id) {
      return true;
    }
    return false;
  },
};

module.exports = updateAlertController;
