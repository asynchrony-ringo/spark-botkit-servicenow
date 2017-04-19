const nightmareHelpers = {
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
    .type('#message-composer', '\u000d'),
  sendDirectMessage: message => nightmare => nightmare
    .type('#message-composer', '@SN')
    .type('#message-composer', '\u000d')
    .type('#message-composer', ` ${message}`)
    .type('#message-composer', '\u000d'),
  evaluateNextSNBotResponse: nightmare => nightmare
    .wait(1000)
    .wait('.convo-filter-menu-list-header')
    .click('.convo-filter-menu-list-header')
    .wait('.convoFilters-FILTER_UNREAD')
    .click('.convoFilters-FILTER_UNREAD')
    .wait(500)
    .wait('.roomListItem:nth-of-type(1)')
    .click('.roomListItem:nth-of-type(1)')
    .wait(1000)
    .wait((botName) => {
      const lastChild = document.querySelector('.activity-item:last-of-type .display-name');
      return lastChild && lastChild.innerText && lastChild.innerText === botName;
    }, process.env.bot_name)
    .evaluate(() => document.querySelector('.activity-item:last-of-type:not(.system-message)').innerText)
};

module.exports = nightmareHelpers;
