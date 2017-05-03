const serviceNowClient = require('../service_now_client.js');

const formatMarkdownList = (tableRecord, attributes) => {
  return Object.keys(attributes).reduce((unorderedListMarkdown, attributeKey) => {
    let attributeValue = tableRecord[attributeKey];
    if (attributeValue === undefined || attributeValue === null) {
      attributeValue = '';
    }
    return `${unorderedListMarkdown}* ${attributes[attributeKey]}: ${attributeValue}\n`;
  }
, '');
};

const statusController = {

  replyWithStatus: (tableName, id, description, attributes, bot, message) =>
    serviceNowClient.getTableRecord(tableName, id)
      .then((tableRecord) => {
        const serviceNowLink = `[${id}](${process.env.serviceNowBaseUrl}/${tableName}.do?sys_id=${id})`;
        const response = `Information for ${description}: ${serviceNowLink}\n${formatMarkdownList(tableRecord.result, attributes)}`;
        bot.reply(message, response);
      })
      .catch((error) => {
        const errorResponse = `Sorry, I was unable to retrieve the ${description}: ${id}. ${error}`;
        bot.reply(message, errorResponse);
      }),
};

module.exports = statusController;
