/* eslint no-useless-escape: off*/

const entityAlias = require('../skillsControllers/entity_alias.js');
const serviceNowClient = require('../service_now_client.js');
const controllerHelper = require('./controller_helper.js');

const extractUpdateEntity = (updateFields) => {
  return new Promise((resolve, reject) => {
    const regex = /[^\[\]]+=\s*\[[^\]]*\]/g;
    const fieldValueMatch = updateFields.match(regex);
    if (!fieldValueMatch) {
      reject('I couldn\'t figure out what you want to update. Please specify your fields by field=value field2=value2...');
    }

    const updateEntity = {};
    for (let i = 0; i < fieldValueMatch.length; i += 1) {
      const fieldValueSplit = fieldValueMatch[i].split('=');
      const field = fieldValueSplit[0].trim();
      const value = fieldValueSplit[1].match(/\[(.*)\]/)[1];
      updateEntity[field] = value;
    }

    resolve(updateEntity);
  });
};

const formatUpdateMessage = (entity, entityId, updateRequest, updateResult) => {
  const unknownFields = Object.keys(updateRequest).filter(k => !updateResult.hasOwnProperty(k));
  const knownFields = Object.keys(updateRequest).filter(k => updateResult.hasOwnProperty(k));

  let formattedMessage = '';

  if (knownFields.length) {
    const attributes = {};
    knownFields.forEach((k) => { attributes[k] = k; });

    const changeList = controllerHelper.formatMarkdownList(updateResult, attributes);
    formattedMessage += `${entity.description} has been updated! [${entityId}](${process.env.base_url}/${entity.table}.do?sys_entityId=${entityId}).\n\n`;
    formattedMessage += `The following fields have been updated:\n${changeList}\n`;
  }

  if (unknownFields.length) {
    formattedMessage += 'The following fields could not be found:\n';
    unknownFields.forEach((field) => { formattedMessage += `* ${field}\n`; });
  }


  return formattedMessage;
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
      .then((updateEntity) => {
        return serviceNowClient.updateTableRecord(entity.table, entityId, updateEntity)
          .then((updateResult) => {
            const updateMessage =
              formatUpdateMessage(entity, entityId, updateEntity, updateResult.result);
            bot.reply(message, updateMessage);
          });
      })
      .catch((error) => {
        bot.reply(message, `Sorry, I ran into trouble updating the ${entity.description}. ${error}`);
      });
  },
};

module.exports = updateController;
