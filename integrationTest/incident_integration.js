const expect = require('chai').expect;
const Nightmare = require('nightmare');
const env = require('node-env-file');
const nightmareHelpers = require('./nightmare_helpers.js');
const uuid = require('uuid/v4');
const serviceNowClient = require('../src/service_now_client.js');

env('.env');

const extractSysIdFromHref = href => href.match('sys_id=(.*)$')[1];

const createIncident = nightmare => nightmare
  .use(nightmareHelpers.login)
  .use(nightmareHelpers.startPrivateConversation)
  .use(nightmareHelpers.sendMessage(`incident create <incident integration ${uuid()}> <software>`))
  .use(nightmareHelpers.evaluateNextSNBotResponseLinkHref);

const editIncident = (id, changes = { short_description: 'foo' }) =>
  serviceNowClient.updateTableRecord('incident', id, changes);

describe('incident', () => {
  it('should respond with incident status after direct message creation in a direct message and group message', () => {
    const nightmare = Nightmare({ show: true, waitTimeout: 60000 });
    return nightmare
      .use(createIncident)
      .then(extractSysIdFromHref)
      .then(incidentId => nightmare
        .use(nightmareHelpers.sendMessage(`incident status ${incidentId}`))
        .use(nightmareHelpers.evaluateNextSNBotResponse)
        .then((directMessageStatusResponse) => {
          const statusResponseMatch = new RegExp(`Information for incident: [${incidentId}]`);
          expect(directMessageStatusResponse).to.match(statusResponseMatch);
          return nightmare
            .use(nightmareHelpers.goHome)
            .use(nightmareHelpers.startGroupConversation)
            .use(nightmareHelpers.sendMentionMessage(`incident status ${incidentId}`))
            .use(nightmareHelpers.evaluateNextSNBotResponse)
            .end()
            .then((directMentionStatusResponse) => {
              expect(directMentionStatusResponse).to.match(statusResponseMatch);
            });
        }));
  });

  it('should send a direct message to caller on incident update', () => {
    const nightmare = Nightmare({ show: true, waitTimeout: 60000 });
    return nightmare
      .use(createIncident)
      .then(extractSysIdFromHref)
      .then(incidentId => editIncident(incidentId))
      .then(json => nightmare
        .use(nightmareHelpers.evaluateNextSNBotResponse)
        .then((response) => {
          const expectedIncidentUpdateMessage = new RegExp(`The incident ${json.result.number} has been updated!`);
          expect(response).to.match(expectedIncidentUpdateMessage);
        }));
  });

  it('should respond to "incident assigned" with user\'s assigned incidents in direct and group messages', () => {
    const nightmare = Nightmare({ show: true, waitTimeout: 60000 });
    return nightmare
      .use(createIncident)
      .then(extractSysIdFromHref)
      .then(incidentId => editIncident(incidentId, { assigned_to: process.env.integrationUser }))
      .then((json) => {
        const incidentText = `${json.result.number}: ${json.result.short_description}`;
        const expectedAssignedStatusMatch = new RegExp(`Found \\d+ incidents:[\\s\\S]*${incidentText}`);
        return nightmare
          .use(nightmareHelpers.sendMessage('incident assigned'))
          .use(nightmareHelpers.evaluateNextSNBotResponse)
          .then((directMessageAssignedStatusResponse) => {
            expect(directMessageAssignedStatusResponse).to.match(expectedAssignedStatusMatch);
            return nightmare
              .use(nightmareHelpers.goHome)
              .use(nightmareHelpers.startGroupConversation)
              .use(nightmareHelpers.sendMentionMessage('incident assigned'))
              .use(nightmareHelpers.evaluateNextSNBotResponse)
              .end()
              .then((directMentionAssignedStatusResponse) => {
                expect(directMentionAssignedStatusResponse).to.match(expectedAssignedStatusMatch);
              });
          });
      });
  });
});
