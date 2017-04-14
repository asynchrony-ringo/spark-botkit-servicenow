const expect = require('chai').expect;
const Nightmare = require('nightmare');
const env = require('node-env-file');
const nightmareHelpers = require('./nightmare_helpers.js');

env('.env');

describe('direct message', () => {
  it('should respond with incident status when status requested', () => {
    const nightmare = Nightmare({ show: true });
    return nightmare
      .use(nightmareHelpers.login)
      .use(nightmareHelpers.startPrivateConversation)
      .use(nightmareHelpers.sendMessage('status 001462683dff9940bb2d16a3cbae2b35'))
      .use(nightmareHelpers.evaluateNextSNBotResponse)
      .end()
      .then((innerText) => {
        expect(innerText).to.match(/Information for incident: [001462683dff9940bb2d16a3cbae2b35]/);
        return Promise.resolve();
      });
  });
});
