const updateAlertDifferenceGatherer = require('./update_alert_difference_gatherer.js');

const validIncident = incident => incident.type === 'Incident';

const updateAlertController = {
  messageCaller: (newObj, oldObj, controller) => {
    if (newObj.callerEmail) {
      const bot = controller.spawn({});

      bot.startPrivateConversation({ user: newObj.callerEmail }, (error, conversation) => {
        if (error) {
          console.log('Error: ', error);
          return;
        }

        const diff = updateAlertDifferenceGatherer.formatMessage(newObj, oldObj);
        conversation.say(`The incident [${newObj.number}](${process.env.serviceNowBaseUrl}/incident.do?sys_id=${newObj.id}) has been updated!\n${diff}`);
      });
    }
  },

  isValid: (newObj, oldObj) => {
    if (!(newObj && oldObj) || newObj.id !== oldObj.id) {
      return false;
    }

    return validIncident(newObj) && validIncident(oldObj);
  },
};

module.exports = updateAlertController;
