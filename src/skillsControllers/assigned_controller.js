const serviceNowClient = require('../service_now_client.js');

const createResponseMessage = (entity, assignedEntities) => {
  const maxEntityCount = 10;

  if (assignedEntities.length === 0) {
    return `Found no assigned ${entity.description}.`;
  }

  let message;
  let entityMessageList;
  if (assignedEntities.length <= maxEntityCount) {
    message = `Found ${assignedEntities.length} assigned ${entity.description}:\n\n`;
    entityMessageList = assignedEntities;
  } else {
    message = `Found ${assignedEntities.length} assigned ${entity.description}. Here are the most recently updated ${maxEntityCount}:\n\n`;
    entityMessageList = assignedEntities.slice(0, maxEntityCount);
  }

  entityMessageList.forEach((record) => {
    const serviceNowLink = `[${record.number}](${process.env.serviceNowBaseUrl}/${entity.table}.do?sys_id=${record.sys_id})`;
    message += ` * ${serviceNowLink}: ${record.short_description}\n`;
  });

  return message;
};


const assignedController = {
  getAssignedEntities: (entity, bot, message) => {
    return serviceNowClient.getTableRecords(entity.table, { sysparm_query: `assigned_to.email=${message.user}^ORDERBYDESCsys_updated_on` })
      .then((assignedEntitiesResponse) => {
        if (!assignedEntitiesResponse.result) {
          bot.reply(message, `Sorry, I was unable to retrieve your assigned ${entity.description}.`);
          return;
        }

        bot.reply(message, createResponseMessage(entity, assignedEntitiesResponse.result));
      })
      .catch((error) => {
        bot.reply(message, `Sorry, I was unable to retrieve your assigned ${entity.description}. ${error}`);
      });
  },
};

module.exports = assignedController;
