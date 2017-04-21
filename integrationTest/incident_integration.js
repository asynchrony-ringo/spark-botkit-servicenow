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

const editIncident = id => serviceNowClient.updateTableRecord('incident', id, { short_description: 'foo' });

describe('incident', () => {
  it('should respond with incident status after direct message creation in a direct message and group message', () => {
    const nightmare = Nightmare({ show: true, waitTimeout: 60000 });
    return nightmare
      .use(createIncident)
      .then(extractSysIdFromHref)
      .then(incidentId => nightmare
        .use(nightmareHelpers.sendMessage(`status ${incidentId}`))
        .use(nightmareHelpers.evaluateNextSNBotResponse)
        .then((dmIncidentStatus) => {
          const expectedIncidentStatus = new RegExp(`Information for incident: [${incidentId}]`);
          expect(dmIncidentStatus).to.match(expectedIncidentStatus);
          return nightmare
            .use(nightmareHelpers.goHome)
            .use(nightmareHelpers.startGroupConversation)
            .use(nightmareHelpers.sendMentionMessage(`status ${incidentId}`))
            .use(nightmareHelpers.evaluateNextSNBotResponse)
            .end()
            .then((mentionIncidentStatus) => {
              expect(mentionIncidentStatus).to.match(expectedIncidentStatus);
            });
        }));
  });

  it.only('should send a direct message to caller on incident update', () => {
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
});
