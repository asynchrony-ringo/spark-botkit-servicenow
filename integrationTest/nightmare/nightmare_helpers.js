const nightmareHelpers = {
  goHome: nightmare => nightmare
    .goto('https://web.ciscospark.com')
    .wait('.user-welcome-text')
    .wait(() => document.querySelectorAll('.user-welcome-text').length === 0),
  login: nightmare => nightmare
    .goto('https://web.ciscospark.com/signin')
    .insert('input[type=text]', process.env.integrationUser)
    .click('button.button')
    .wait('input[type=password]')
    .insert('input[type=password]', process.env.integrationPassword)
    .click('button')
    .wait('.user-welcome-text')
    .wait(() => document.querySelectorAll('.user-welcome-text').length === 0),
  startPrivateConversation: nightmare => nightmare
    .insert('input.add-people', `${process.env.bot_name}@sparkbot.io`)
    .insert('input.add-people', '\u000d')
    .click('button.btnCreateRoom')
    .wait('#message-composer')
    .wait(1000),
  startGroupConversation: nightmare => nightmare
    .insert('input.add-people', `${process.env.bot_name}@sparkbot.io`)
    .insert('input.add-people', '\u000d')
    .insert('input.add-people', process.env.integrationUser2)
    .insert('input.add-people', '\u000d')
    .wait(1000)
    .click('button.btnCreateRoom')
    .wait('#message-composer')
    .wait(1000),
  sendMessage: message => nightmare => nightmare
    .type('#message-composer', message)
    .type('#message-composer', '\u000d')
    .use(nightmareHelpers.waitForMyResponse),
  sendMentionMessage: message => nightmare => nightmare
    .type('#message-composer', '@SN')
    .type('#message-composer', '\u000d')
    .type('#message-composer', ` ${message}`)
    .type('#message-composer', '\u000d')
    .use(nightmareHelpers.waitForMyResponse),
  waitForMyResponse: nightmare => nightmare
    .use(nightmareHelpers.waitForNextResponse('You')),
  evaluateNextSNBotResponse: nightmare => nightmare
    .use(nightmareHelpers.waitForNextSNBotResponse)
    .evaluate(() => document.querySelector('.activity-item:last-of-type:not(.system-message)').innerText),
  evaluateNextSNBotResponseLinkHref: nightmare => nightmare
    .use(nightmareHelpers.waitForNextSNBotResponse)
    .evaluate(() => document.querySelector('.activity-item:last-of-type:not(.system-message) a').href),
  waitForNextSNBotResponse: nightmare => nightmare
    .wait(1000)
    .wait('.convo-filter-menu-list-header')
    .click('.convo-filter-menu-list-header')
    .wait('.convoFilters-FILTER_UNREAD')
    .click('.convoFilters-FILTER_UNREAD')
    .wait(500)
    .wait((botName) => {
      const newestUnreadItem = document.querySelector('.roomListItem:nth-of-type(1) .roomListItem-title-text');
      return newestUnreadItem && newestUnreadItem.innerText.split(', ').indexOf(botName) !== -1;
    }, process.env.bot_name)
    .click('.roomListItem:nth-of-type(1)')
    .wait(1000)
    .use(nightmareHelpers.waitForNextResponse(process.env.bot_name)),
  waitForNextResponse: displayName => nightmare => nightmare
    .wait((displayNameBrowserParam) => {
      const lastChild = document.querySelector('.activity-item:last-of-type .display-name');
      return lastChild && lastChild.innerText && lastChild.innerText === displayNameBrowserParam;
    }, displayName),
};

module.exports = nightmareHelpers;
