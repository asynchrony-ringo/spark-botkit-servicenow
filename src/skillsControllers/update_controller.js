/* eslint no-useless-escape: off*/

const entityAlias = require('../skillsControllers/entity_alias.js');
const serviceNowClient = require('../service_now_client.js');

const extractUpdateEntity = (updateFields) => {
  const regex = /[^\[\]]+=\s*\[[^\]]*\]/g;
  const fieldValueMatch = updateFields.match(regex);
  if (!fieldValueMatch) {
    return Promise.reject('I couldn\'t figure out what you want to update. Please specify your fields by field=value field2=value2...');
  }

  const updateEntity = {};
  for (let i = 0; i < fieldValueMatch.length; i += 1) {
    const fieldValueSplit = fieldValueMatch[i].split('=');
    const field = fieldValueSplit[0].trim();
    const value = fieldValueSplit[1].match(/\[(.*)\]/)[1];
    updateEntity[field] = value;
  }

  return Promise.resolve(updateEntity);
};

const updateController = {
  replyWithUpdate: (alias, entityId, updateFields, bot, message) => {
    const entity = entityAlias.get(alias);

    if (!entity) {
      bot.reply(message, `Sorry, I'm not configured to update ${alias}.`);
      return Promise.resolve();
    }

    if (updateFields === 'guide') {
      return serviceNowClient.getTableRecord(entity.table, entityId)
        .then(record => bot.reply(message, `Current raw object:\n\`\`\`\n${JSON.stringify(record, 0, 2)}`))
        .catch(error => bot.reply(message, `Sorry, I could not find the ${entity.description}. ${error}`));
    }

    return extractUpdateEntity(updateFields)
      .then(updateEntity =>
        serviceNowClient.updateTableRecord(entity.table, entityId, updateEntity))
      .then(() => bot.reply(message, `${entity.description} has been updated! [${entityId}](${process.env.base_url}/${entity.table}.do?sys_entityId=${entityId}).`))
      .catch((error) => {
        bot.reply(message, `Sorry, I ran into trouble updating the ${entity.description}. ${error}`);
      });
  },
};

module.exports = updateController;
