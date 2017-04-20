const expect = require('chai').expect;
const Nightmare = require('nightmare');
const env = require('node-env-file');
const nightmareHelpers = require('./nightmare_helpers.js');
const uuid = require('uuid/v4');

env('.env');

describe('incident', () => {
  it('should respond with incident status after direct message creation in a direct message and group message', () => {
    const nightmare = Nightmare({ show: true, waitTimeout: 60000 });
    return nightmare
        .use(nightmareHelpers.login)
        .use(nightmareHelpers.startPrivateConversation)
        .use(nightmareHelpers.sendMessage(`incident create <incident integration ${uuid()}> <software>`))
        .use(nightmareHelpers.evaluateNextSNBotResponseLinkHref)
        .then((serviceNowHref) => {
          const incidentId = serviceNowHref.match('sys_id=(.*)$')[1];
          return nightmare
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
            });
        });
  });
});
