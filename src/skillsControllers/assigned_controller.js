const serviceNowClient = require('../service_now_client.js');

const createResponseMessage = (tableName, description, assignedEntities) => {
  const maxEntityCount = 10;

  if (assignedEntities.length === 0) {
    return `Found no assigned ${description}.`;
  }

  let message;
  let entityMessageList;
  if (assignedEntities.length <= maxEntityCount) {
    message = `Found ${assignedEntities.length} assigned ${description}:\n\n`;
    entityMessageList = assignedEntities;
  } else {
    message = `Found ${assignedEntities.length} assigned ${description}. Here are the most recently updated ${maxEntityCount}:\n\n`;
    entityMessageList = assignedEntities.slice(0, maxEntityCount);
  }

  entityMessageList.forEach((record) => {
    const serviceNowLink = `[${record.sys_id}](${process.env.base_url}/${tableName}.do?sys_id=${record.sys_id})`;
    message += ` * ${serviceNowLink}: ${record.short_description}\n`;
  });

  return message;
};


const assignedController = {
  getAssignedEntities: (tableName, description, bot, message) => {
    return serviceNowClient.getTableRecords(tableName, { sysparm_query: `assigned_to.email=${message.user}^ORDERBYDESCsys_updated_on` })
      .then((assignedEntitiesResponse) => {
        if (!assignedEntitiesResponse.result) {
          bot.reply(message, `Sorry, I was unable to retrieve your assigned ${description}.`);
          return;
        }

        bot.reply(message,
          createResponseMessage(tableName, description, assignedEntitiesResponse.result));
      })
      .catch((error) => {
        bot.reply(message, `Sorry, I was unable to retrieve your assigned ${description}. ${error}`);
      });
  },
};

module.exports = assignedController;
