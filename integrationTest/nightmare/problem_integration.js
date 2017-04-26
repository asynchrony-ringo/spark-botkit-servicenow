const expect = require('chai').expect;
const Nightmare = require('nightmare');
const env = require('node-env-file');
const nightmareHelpers = require('./nightmare_helpers.js');

env('.env');

describe('problem', () => {
  const problemId = '051e8f6cc0a8016600cdf7fd19e10414';

  it('should respond with problem status in a direct message and group message', () => {
    const nightmare = Nightmare({ show: true, waitTimeout: 60000 });
    return nightmare
      .use(nightmareHelpers.login)
      .use(nightmareHelpers.startPrivateConversation)
      .use(nightmareHelpers.sendMessage(`problem status ${problemId}`))
      .use(nightmareHelpers.evaluateNextSNBotResponse)
      .then((directMessageStatusResponse) => {
        const expectedStatusMatch = new RegExp(`Information for problem: [${problemId}]`);
        expect(directMessageStatusResponse).to.match(expectedStatusMatch);
        return nightmare
          .use(nightmareHelpers.goHome)
          .use(nightmareHelpers.startGroupConversation)
          .use(nightmareHelpers.sendMentionMessage(`problem status ${problemId}`))
          .use(nightmareHelpers.evaluateNextSNBotResponse)
          .end()
          .then((directMentionStatusResponse) => {
            expect(directMentionStatusResponse).to.match(expectedStatusMatch);
          });
      });
  });
});
