const updateAlertDifferenceGatherer = {
  formatMessage: (newObject = {}, oldObject = {}) => {
    const diffs = [];

    const allFields = new Set(Object.keys(newObject));
    Object.keys(oldObject).forEach(k => allFields.add(k));
    allFields.delete('attributes');

    Array.from(allFields).sort().forEach((key) => {
      if (!newObject.hasOwnProperty(key) || (newObject[key] === '' && oldObject[key] !== '')) {
        diffs.push(` * ${key} was removed`);
      } else if (!oldObject.hasOwnProperty(key) || (oldObject[key] === '' && newObject[key] !== '')) {
        diffs.push(` * ${key} was added: ${newObject[key]}`);
      } else if (newObject[key] !== oldObject[key]) {
        diffs.push(` * ${key} was updated from ${oldObject[key]} to ${newObject[key]}`);
      }
    });

    return diffs.join('\n');
  },
};

module.exports = updateAlertDifferenceGatherer;
