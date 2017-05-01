const debug = require('debug')('botkit:incoming_webhooks');
const bodyParser = require('body-parser');
const hmacSha1Calculator = require('../routeControllers/hmac_sha1_calculator');

module.exports = (webserver, controller) => {
  debug('Configured POST /ciscospark/receive url for receiving events');

  webserver.use('/ciscospark/receive', [
    bodyParser.json({ verify: hmacSha1Calculator.addToRequest }),
    bodyParser.urlencoded({ extended: true })]);

  webserver.post('/ciscospark/receive', (req, res) => {
    if (req.hmacSHA1 !== req.get('X-Spark-Signature')) {
      res.status(403).send('HMAC validation error');
      return;
    }
    res.status(200).send('ok');

    const bot = controller.spawn({});

    // Now, pass the webhook into be processed
    controller.handleWebhookPayload(req, res, bot);
  });
};
