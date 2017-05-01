const updateAlertDifferenceGatherer = require('./update_alert_difference_gatherer.js');

const updateAlertController = {
  messageCaller: (newObj, oldObj, controller) => {
    if (newObj.callerEmail) {
      const bot = controller.spawn({});

      bot.startPrivateConversation({ user: newObj.callerEmail }, (error, conversation) => {
        if (error) {
          console.log(`Error starting conversation with ${newObj.callerEmail}: `, error);
          return;
        }

        const tableName = newObj.type.replace(/\s/, '_').toLowerCase();
        const diff = updateAlertDifferenceGatherer.formatMessage(newObj, oldObj);
        conversation.say(`The ${newObj.type} [${newObj.number}](${process.env.serviceNowBaseUrl}/${tableName}.do?sys_id=${newObj.id}) has been updated!\n${diff}`);
      });
    }
  },

  isValid: (newObj, oldObj) => {
    if (newObj && oldObj
      && newObj.type && oldObj.type && newObj.type === oldObj.type
      && newObj.id && oldObj.id && newObj.id === oldObj.id) {
      return true;
    }
    return false;
  },
};

module.exports = updateAlertController;
