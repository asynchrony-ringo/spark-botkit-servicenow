/* eslint no-param-reassign: off*/

const maxMessageLength = 6000;

const truncateLargeMessageMiddleware = (controller) => {
  controller.middleware.send.use((bot, message, next) => {
    if (message.text.length > maxMessageLength) {
      message.text = `${message.text.substring(0, maxMessageLength)}...`;
    }
    next();
  });
};

module.exports = truncateLargeMessageMiddleware;
