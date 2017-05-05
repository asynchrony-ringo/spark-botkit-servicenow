const updateController = require('../../src/skillsControllers/update_controller.js');
const sinon = require('sinon');
const expect = require('chai').expect;
const entityAlias = require('../../src/skillsControllers/entity_alias.js');
const serviceNowClient = require('../../src/service_now_client.js');


describe('update controller', () => {
  const alias = 'incident';
  const entityId = 'entityId';
  const entity = entityAlias.get(alias);
  const baseUrl = 'serviceNow.we';
  let bot;
  let message;


  beforeEach(() => {
    bot = { reply: sinon.stub() };
    message = { some: 'message' };
    sinon.stub(serviceNowClient, 'updateTableRecord');
    sinon.stub(serviceNowClient, 'getTableRecord');
    process.env.base_url = baseUrl;
  });

  afterEach(() => {
    serviceNowClient.updateTableRecord.restore();
    serviceNowClient.getTableRecord.restore();
    delete process.env.base_url;
  });

  describe('guide', () => {
    const updateCommands = 'guide';
    it('should reply with raw version of entity when guide is requested and entity exists', () => {
      const entityDescription = {
        id: '12345',
        description: 'test',
        something: 'something',
      };

      serviceNowClient.getTableRecord.returns(Promise.resolve(entityDescription));

      return updateController.replyWithUpdate(alias, entityId, updateCommands, bot, message)
      .then(() => {
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0]).to.deep.equal([message, `Current raw object:\n\`\`\`\n${JSON.stringify(entityDescription, 0, 2)}`]);
      });
    });

    it('should reply with error message when guide for entity that does not exist is requested', () => {
      serviceNowClient.getTableRecord.returns(Promise.reject('Error!'));

      return updateController.replyWithUpdate(alias, entityId, updateCommands, bot, message)
        .then(() => {
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0]).to.deep.equal([message, `Sorry, I could not find the ${entity.description}. Error!`]);
        });
    });
  });

  describe('update', () => {
    it('should reply with unknown entity message if unknown alias', () => {
      const updateCommands = '';
      return updateController.replyWithUpdate('unknown alias', entityId, updateCommands, bot, message)
      .then(() => {
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0]).to.deep.equal([message, 'Sorry, I\'m not configured to update unknown alias.']);
      });
    });

    ['', 'badcommand!', '=', '=[bad]'].forEach((badCommand) => {
      it(`should reply with unknown commands message if command = ${badCommand}`, () => {
        return updateController.replyWithUpdate(alias, entityId, badCommand, bot, message)
        .then(() => {
          expect(bot.reply.calledOnce).to.be.true;
          expect(bot.reply.args[0]).to.deep.equal([message, `Sorry, I ran into trouble updating the ${entity.description}. I couldn't figure out what you want to update. Please specify your fields by field=value field2=value2...`]);
        });
      });
    });


    [
      {
        command: 'goodcommand=[good]',
        expectedUpdate: { goodcommand: 'good' },
        description: 'single good command',
      },
      {
        command: 'good1=[good] good2=[good]',
        expectedUpdate: { good1: 'good', good2: 'good' },
        description: 'two good commands',
      },
      {
        command: ' good = [command] ',
        expectedUpdate: { good: 'command' },
        description: 'good commands with spaces',
      },
    ].forEach((testCase) => {
      const { command, expectedUpdate, description } = testCase;
      it(`should update the entity when ${description}`, () => {
        serviceNowClient.updateTableRecord.returns(Promise.resolve({ result: {} }));
        return updateController.replyWithUpdate(alias, entityId, command, bot, message)
        .then(() => {
          expect(serviceNowClient.updateTableRecord.calledOnce);
          expect(serviceNowClient.updateTableRecord.args[0])
            .to.deep.equal([entity.table, entityId, expectedUpdate]);
        })
        .catch(error => Promise.reject(`Error! Bot reply: ${JSON.stringify(bot.reply.args)}`, error));
      });
    });

    it('should reply with success message when update is successfully updated', () => {
      const updateCommands = 'goodcommand=[good]';
      serviceNowClient.updateTableRecord.returns(Promise.resolve({ result: { goodcommand: 'good' } }));
      return updateController.replyWithUpdate(alias, entityId, updateCommands, bot, message)
      .then(() => {
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0]).to.deep.equal([message, `${entity.description} has been updated! [${entityId}](${baseUrl}/${entity.table}.do?sys_entityId=${entityId}).\n\nThe following fields have been updated:\n* goodcommand: good\n\n`]);
      });
    });

    it('should reply with success message when update is successfully updated with two fields', () => {
      const updateCommands = 'goodcommand=[good] goodcommand2=[reallygood]';
      serviceNowClient.updateTableRecord.returns(Promise.resolve({ result: { goodcommand: 'good', goodcommand2: 'reallygood' } }));
      return updateController.replyWithUpdate(alias, entityId, updateCommands, bot, message)
      .then(() => {
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0]).to.deep.equal([message, `${entity.description} has been updated! [${entityId}](${baseUrl}/${entity.table}.do?sys_entityId=${entityId}).\n\nThe following fields have been updated:\n* goodcommand: good\n* goodcommand2: reallygood\n\n`]);
      });
    });

    it('should reply with missing field if not in update object', () => {
      const updateCommands = 'unknown=[odd]';
      serviceNowClient.updateTableRecord.returns(Promise.resolve({ result: { } }));
      return updateController.replyWithUpdate(alias, entityId, updateCommands, bot, message)
      .then(() => {
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0]).to.deep.equal([message, 'The following fields could not be found:\n* unknown\n']);
      });
    });

    it('should reply with both successes and failures in update object', () => {
      const updateCommands = 'goodcommand=[good] unknownfield=[odd]';
      serviceNowClient.updateTableRecord.returns(Promise.resolve({ result: { goodcommand: 'good' } }));
      return updateController.replyWithUpdate(alias, entityId, updateCommands, bot, message)
      .then(() => {
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0]).to.deep.equal([message, `${entity.description} has been updated! [${entityId}](${baseUrl}/${entity.table}.do?sys_entityId=${entityId}).\n\nThe following fields have been updated:\n* goodcommand: good\n\nThe following fields could not be found:\n* unknownfield\n`]);
      });
    });

    it('should reply with failure message when update is not successful', () => {
      const updateCommands = 'goodcommand=[good]';
      serviceNowClient.updateTableRecord.returns(Promise.reject('Error!'));
      return updateController.replyWithUpdate(alias, entityId, updateCommands, bot, message)
      .then(() => {
        expect(bot.reply.calledOnce).to.be.true;
        expect(bot.reply.args[0]).to.deep.equal([message, `Sorry, I ran into trouble updating the ${entity.description}. Error!`]);
      });
    });
  });
});
