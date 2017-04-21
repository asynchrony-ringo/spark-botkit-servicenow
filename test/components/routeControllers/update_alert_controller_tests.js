const updateAlertController = require('../../../src/components/routeControllers/update_alert_controller.js');
const expect = require('chai').expect;

describe('update alert controller', () => {
  describe('isValid', () => {
    it('should return a successful status and message when the request is of correct type', () => {
      const newObject = {
        type: 'Incident',
      };
      const oldObject = {
        type: 'Incident',
      };
      const result = updateAlertController.isValid(newObject, oldObject);
      expect(result).to.be.true;
    });

    [
      {
        new: undefined,
        old: undefined,
        description: 'new and old undefined',
      },
      {
        new: 'not an object',
        old: 'not an object',
        description: 'new and old are not objects',
      },
      {
        new: {},
        old: {},
        description: 'new and old empty objects',
      },
      {
        new: { type: 'Foo' },
        old: { type: 'Foo' },
        description: 'neither has correct attribute',
      },
      {
        new: { type: 'Incident' },
        old: {},
        description: 'new has more than old',
      },
      {
        new: {},
        old: { type: 'Incident' },
        description: 'old has more than new',
      },
      {
        new: { type: 'Incident', id: '1' },
        old: { type: 'Incident', id: '2' },
        description: 'different ids',
      },
      {
        new: { type: 'Incident', id: '1' },
        old: { id: '1' },
        description: 'old element does not contain type attribute',
      },
      {
        new: { type: 'Incident', id: '1' },
        old: { type: 'Foo', id: '1' },
        description: 'old element is not an incident',
      },
    ].forEach((testCase) => {
      it(`should return false when ${testCase.description}`, () => {
        const result = updateAlertController.isValid(testCase.new, testCase.old);
        expect(result).to.be.false;
      });
    });
  });
});
