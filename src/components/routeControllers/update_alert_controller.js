const validIncident = incident => incident.type === 'Incident';

const updateAlertController = {
  isValid: (newObj, oldObj) => {
    if (!(newObj && oldObj) || newObj.id !== oldObj.id) {
      return false;
    }

    return validIncident(newObj) && validIncident(oldObj);
  },
};

module.exports = updateAlertController;
