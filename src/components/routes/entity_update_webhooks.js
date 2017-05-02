const debug = require('debug')('botkit:incoming_webhooks');
const updateAlertController = require('../routeControllers/update_alert_controller.js');
const bodyParser = require('body-parser');

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

  webserver.use('/servicenow/update', [bodyParser.json(), bodyParser.urlencoded({ extended: true })]);
  webserver.post('/servicenow/update', (req, res) => {
    if (!updateAlertController.isValid(req.body.new, req.body.old)) {
      sendFailureResponse(res);
      return;
    }

    updateAlertController.messageCaller(req.body.new, req.body.old, controller);
    sendSuccessResponse(res);
  });
};

module.exports = entityUpdateWebhooks;
