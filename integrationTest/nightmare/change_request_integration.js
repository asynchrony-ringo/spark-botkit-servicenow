const expect = require('chai').expect;
const Nightmare = require('nightmare');
const nightmareHelpers = require('./nightmare_helpers.js');

describe('change request', () => {
  const changeRequestId = '9d457fbac6112287007379b57c6b2e60';

  it.only('should respond with change request status in a direct message and group message', () => {
    const nightmare = Nightmare({ show: true, waitTimeout: 60000 });
    return nightmare
      .use(nightmareHelpers.login)
      .use(nightmareHelpers.startPrivateConversation)
      .use(nightmareHelpers.sendMessage(`cr status ${changeRequestId}`))
      .use(nightmareHelpers.evaluateNextSNBotResponse)
      .then((directMessageStatusResponse) => {
        const statusResponseMatch = new RegExp(`Information for change request: [${changeRequestId}]`);
        expect(directMessageStatusResponse).to.match(statusResponseMatch);
        return nightmare
          .use(nightmareHelpers.goHome)
          .use(nightmareHelpers.startGroupConversation)
          .use(nightmareHelpers.sendMentionMessage(`cr status ${changeRequestId}`))
          .use(nightmareHelpers.evaluateNextSNBotResponse)
          .end()
          .then((directMentionStatusResponse) => {
            expect(directMentionStatusResponse).to.match(statusResponseMatch);
          });
      });
  });
});
