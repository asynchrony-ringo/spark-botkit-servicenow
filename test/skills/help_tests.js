const sinon = require('sinon');
const expect = require('chai').expect;
const help = require('../../src/skills/help.js');
const fs = require('fs');

describe('help', () => {
  let controller;

  beforeEach(() => {
    controller = { hears: sinon.spy() };

    help(controller);
  });

  it('should register hear listener on controller', () => {
    expect(controller.hears.calledOnce).to.be.true;
    expect(controller.hears.args[0][0]).to.deep.equal(['^help$']);
    expect(controller.hears.args[0][1]).to.equal('direct_message,direct_mention');
    expect(controller.hears.args[0][2]).to.be.a('function');
  });

  describe('listener callback', () => {
    let listenerCallback;
    let bot;
    let message;

    beforeEach(() => {
      bot = { reply: sinon.spy() };
      message = {};
      listenerCallback = controller.hears.args[0][2];
      sinon.stub(fs, 'readFile');

      listenerCallback(bot, message);
    });

    afterEach(() => {
      fs.readFile.restore();
    });

    it('calls fs readFile', () => {
      expect(fs.readFile.calledOnce).to.be.true;
      expect(fs.readFile.args[0][0]).to.equal('docs/help.md');
      expect(fs.readFile.args[0][1]).to.equal('utf-8');
      expect(fs.readFile.args[0][2]).to.be.a('Function');
    });

    describe('readFile callback', () => {
      let readFileCallback;

      beforeEach(() => {
        readFileCallback = fs.readFile.args[0][2];

        readFileCallback(null, 'Super helpful help text.');
      });

      it('should reply with help message', () => {
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0][0]).to.equal(message);
        expect(bot.reply.args[0][1]).to.equal('Super helpful help text.');
      });
    });
  });
});
