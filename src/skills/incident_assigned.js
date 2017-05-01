const serviceNowClient = require('../service_now_client.js');

const createResponseMessage = (assignedIncidents) => {
  const maxIncidentCount = 10;

  if (assignedIncidents.length === 0) {
    return 'Found no assigned Incidents.';
  }

  let message;
  let incidentMessageList;
  if (assignedIncidents.length <= maxIncidentCount) {
    message = `Found ${assignedIncidents.length} assigned Incidents:\n\n`;
    incidentMessageList = assignedIncidents;
  } else {
    message = `Found ${assignedIncidents.length} assigned Incidents. Here are the most recently updated ${maxIncidentCount}:\n\n`;
    incidentMessageList = assignedIncidents.slice(0, maxIncidentCount);
  }
  incidentMessageList.forEach((record) => {
    const serviceNowLink = `[${record.number}](${process.env.serviceNowBaseUrl}/incident.do?sys_id=${record.sys_id})`;
    message += ` * ${serviceNowLink}: ${record.short_description}\n`;
  });

  return message;
};


const incidentAssigned = (controller) => {
  controller.hears(['incident assigned'], 'direct_message,direct_mention', (bot, message) =>
    serviceNowClient.getTableRecords('incident', { sysparm_query: `assigned_to.email=${message.user}^ORDERBYDESCsys_updated_on` })
    .then((jsonResult) => {
      if (jsonResult.result) {
        const tableRecords = jsonResult.result;
        bot.reply(message, createResponseMessage(tableRecords));
      } else {
        bot.reply(message, 'Sorry, I was unable to retrieve your assigned Incidents.');
      }
    })
    .catch((error) => {
      const errorResponse = `Sorry, I was unable to retrieve your assigned Incidents. ${error}`;
      bot.reply(message, errorResponse);
    }));
};

module.exports = incidentAssigned;
