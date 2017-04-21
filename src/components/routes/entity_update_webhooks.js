const debug = require('debug')('botkit:incoming_webhooks');
const updateAlertController = require('../routeControllers/update_alert_controller.js');

const sendFailureResponse = (res) => {
  res.status(400);
  res.send('Bad Request');
};

const sendSuccessResponse = (res) => {
  res.status(200);
  res.send('ok');
};

const entityUpdateWebhooks = (webserver, controller) => {
  debug('Configured POST /servicenow/update for receiving events');
  webserver.post('/servicenow/update', (req, res) => {
    if (!updateAlertController.isValid(req.body.new, req.body.old)) {
      sendFailureResponse(res);
      return;
    }

    const incident = req.body.new;

    if (incident.callerEmail) {
      const bot = controller.spawn({});

      bot.startPrivateConversation({ user: incident.callerEmail }, (error, conversation) => {
        if (error) {
          console.log('Error: ', error);
          return;
        }

        conversation.say(`An incident you reported has been updated! [${incident.number}](${process.env.serviceNowBaseUrl}/incident.do?sys_id=${incident.id})`);
      });
    }

    sendSuccessResponse(res);
  });
};

module.exports = entityUpdateWebhooks;
