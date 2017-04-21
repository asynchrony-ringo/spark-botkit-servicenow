const updateAlertDifferenceGatherer = require('../../../src/components/routeControllers/update_alert_difference_gatherer.js');
const expect = require('chai').expect;

describe('update alert difference gatherer', () => {
  it('should return empty string if object undefined', () => {
    expect(updateAlertDifferenceGatherer.formatMessage()).to.be.empty;
  });

  it('should return empty string if empty objects', () => {
    expect(updateAlertDifferenceGatherer.formatMessage({}, {})).to.be.empty;
  });

  it('should return empty if objects are equal', () => {
    const newObject = {
      name: 'foo',
      title: 'bar',
    };
    const oldObject = {
      name: 'foo',
      title: 'bar',
    };

    expect(updateAlertDifferenceGatherer.formatMessage(newObject, oldObject)).to.be.empty;
  });

  it('should return correct format when values have been edited', () => {
    const newObject = {
      constant: 'field',
      name: 'foo',
      title: 'bar',
    };
    const oldObject = {
      constant: 'field',
      name: 'bar',
      title: 'foo',
    };
    const formattedDiffs = updateAlertDifferenceGatherer
      .formatMessage(newObject, oldObject).split('\n');
    expect(formattedDiffs.length).to.equal(2);
    expect(formattedDiffs[0]).to.equal(' * name was updated from bar to foo');
    expect(formattedDiffs[1]).to.equal(' * title was updated from foo to bar');
  });

  it('should return correct format when values have been deleted', () => {
    const newObject = {
      constant: 'field',
    };
    const oldObject = {
      constant: 'field',
      name: 'bar',
      title: 'foo',
    };
    const formattedDiffs = updateAlertDifferenceGatherer
      .formatMessage(newObject, oldObject).split('\n');
    expect(formattedDiffs.length).to.equal(2);
    expect(formattedDiffs[0]).to.equal(' * name was removed');
    expect(formattedDiffs[1]).to.equal(' * title was removed');
  });

  it('should return correct format when values have been added', () => {
    const oldObject = {
      constant: 'field',
    };
    const newObject = {
      constant: 'field',
      name: 'bar',
      title: 'foo',
    };
    const formattedDiffs = updateAlertDifferenceGatherer
      .formatMessage(newObject, oldObject).split('\n');
    expect(formattedDiffs.length).to.equal(2);
    expect(formattedDiffs[0]).to.equal(' * name was added: bar');
    expect(formattedDiffs[1]).to.equal(' * title was added: foo');
  });

  it('should return correct message when a value changed from "" or changed to ""', () => {
    const oldObject = {
      title: '',
      name: 'foo',
      id: '',
    };
    const newObject = {
      title: 'bar',
      name: '',
      id: '',
    };
    const formattedDiffs = updateAlertDifferenceGatherer
      .formatMessage(newObject, oldObject).split('\n');
    expect(formattedDiffs.length).to.equal(2);
    expect(formattedDiffs[0]).to.equal(' * title was added: bar');
    expect(formattedDiffs[1]).to.equal(' * name was removed');
  });
});
