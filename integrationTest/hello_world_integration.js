const expect = require('chai').expect;
const Nightmare = require('nightmare');
const env = require('node-env-file');
const nightmareHelpers = require('./nightmare_helpers.js');

env('.env');

describe('hello world', () => {
  it('should return world! when prompted with hello', () => {
    const nightmare = Nightmare({ show: true });
    return nightmare
      .use(nightmareHelpers.login)
      .insert('input.add-people', 'SNBot@sparkbot.io')
      .insert('input.add-people', '\u000d')
      .click('button.btnCreateRoom')
      .wait('#message-composer')
      .wait(1000)
      .type('#message-composer', 'hello')
      .type('#message-composer', '\u000d')
      .wait(() => {
        const lastChild = document.querySelector('.activity-item:last-child');
        return lastChild && lastChild.innerText && lastChild.innerText.indexOf('SNBot') !== -1;
      })
      .evaluate(() => document.querySelector('.activity-item:last-child').innerText)
      .end()
      .then((innerText) => {
        expect(innerText).to.contain('world!');
      });
  });
});
