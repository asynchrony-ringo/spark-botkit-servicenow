const maxInlineLength = 150;

const formatValue = (value) => {
  if (value.length > maxInlineLength || value.match(/[\n\r]+/)) {
    return `\n> ${value.split(/[\n\r]+/).join(' ')}\n\n`;
  }
  return `**${value}**`;
};

const updateDifferenceGatherer = {
  formatMessage: (newObject = {}, oldObject = {}) => {
    const diffs = [];

    const allFields = new Set(Object.keys(newObject));
    Object.keys(oldObject).forEach(k => allFields.add(k));
    allFields.delete('attributes');

    Array.from(allFields).sort().forEach((key) => {
      if (!newObject.hasOwnProperty(key) || (newObject[key] === '' && oldObject[key] !== '')) {
        diffs.push(` * ${key} was removed`);
      } else if (!oldObject.hasOwnProperty(key) || (oldObject[key] === '' && newObject[key] !== '')) {
        diffs.push(` * ${key} was added: ${formatValue(newObject[key])}`);
      } else if (newObject[key] !== oldObject[key]) {
        diffs.push(` * ${key} was updated from ${formatValue(oldObject[key])} to ${formatValue(newObject[key])}`);
      }
    });

    return diffs.join('\n');
  },
};

module.exports = updateDifferenceGatherer;
