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

        conversation.say(`An incident you reported has been updated! [${newObj.number}](${process.env.serviceNowBaseUrl}/incident.do?sys_id=${newObj.id})`);
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
