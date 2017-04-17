const expect = require('chai').expect;
const Nightmare = require('nightmare');
const env = require('node-env-file');
const nightmareHelpers = require('./nightmare_helpers.js');

env('.env');

describe('incident status', () => {
  [
    {
      description: 'direct message',
      conversationStarter: nightmareHelpers.startPrivateConversation,
      messageSender: nightmareHelpers.sendMessage
    },
    {
      description: 'direct mention',
      conversationStarter: nightmareHelpers.startGroupConversation,
      messageSender: nightmareHelpers.sendDirectMessage
    }
  ].forEach(({ description, conversationStarter, messageSender }) => {
    it(`should respond with incident status when ${description}`, () => {
      const nightmare = Nightmare({ show: true });
      return nightmare
        .use(nightmareHelpers.login)
        .use(conversationStarter)
        .use(messageSender('status 001462683dff9940bb2d16a3cbae2b35'))
        .use(nightmareHelpers.evaluateNextSNBotResponse)
        .end()
        .then((innerText) => {
          expect(innerText).to.match(/Information for incident: [001462683dff9940bb2d16a3cbae2b35]/);
          return Promise.resolve();
        });
    });
  });
});
