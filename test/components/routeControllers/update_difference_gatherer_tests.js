const updateDifferenceGatherer = require('../../../src/update_difference_gatherer.js');
const expect = require('chai').expect;

describe('update alert difference gatherer', () => {
  it('should return empty string if object undefined', () => {
    expect(updateDifferenceGatherer.formatMessage()).to.be.empty;
  });

  it('should return empty string if empty objects', () => {
    expect(updateDifferenceGatherer.formatMessage({}, {})).to.be.empty;
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

    expect(updateDifferenceGatherer.formatMessage(newObject, oldObject)).to.be.empty;
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
    const formattedDiffs = updateDifferenceGatherer
      .formatMessage(newObject, oldObject).split('\n');
    expect(formattedDiffs.length).to.equal(2);
    expect(formattedDiffs[0]).to.equal(' * name was updated from **bar** to **foo**');
    expect(formattedDiffs[1]).to.equal(' * title was updated from **foo** to **bar**');
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
    const formattedDiffs = updateDifferenceGatherer
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
    const formattedDiffs = updateDifferenceGatherer
      .formatMessage(newObject, oldObject).split('\n');
    expect(formattedDiffs.length).to.equal(2);
    expect(formattedDiffs[0]).to.equal(' * name was added: **bar**');
    expect(formattedDiffs[1]).to.equal(' * title was added: **foo**');
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
    const formattedDiffs = updateDifferenceGatherer
      .formatMessage(newObject, oldObject).split('\n');
    expect(formattedDiffs.length).to.equal(2);
    expect(formattedDiffs[0]).to.equal(' * name was removed');
    expect(formattedDiffs[1]).to.equal(' * title was added: **bar**');
  });

  it('should order the keys alphabetically', () => {
    const newObject = {
      monkey: 'banana',
      zebra: 'stripe',
      apple: 'foo',
      title: 'bar',
    };
    const oldObject = {
      monkey: 'tree',
      zebra: 'savanna',
      apple: 'bar',
      title: 'foo',
    };
    const formattedDiffs = updateDifferenceGatherer
      .formatMessage(newObject, oldObject).split('\n');
    expect(formattedDiffs.length).to.equal(4);
    expect(formattedDiffs[0]).to.equal(' * apple was updated from **bar** to **foo**');
    expect(formattedDiffs[1]).to.equal(' * monkey was updated from **tree** to **banana**');
    expect(formattedDiffs[2]).to.equal(' * title was updated from **foo** to **bar**');
    expect(formattedDiffs[3]).to.equal(' * zebra was updated from **savanna** to **stripe**');
  });

  [
    {
      new: `${'characters'.repeat(15)}z`,
      old: `${'whizzbangs'.repeat(15)}z`,
      description: 'the value is long',
    },
    {
      new: 'hi\n\n\nhello',
      old: 'yo\nsup',
      description: 'the value contains newlines',
    },
    {
      new: 'hi\rhello',
      old: 'yo\r\r\rsup',
      description: 'the value contains carriage returns',
    },
  ].forEach((testCase) => {
    it(`should use blockquotes when ${testCase.description}`, () => {
      const newObject = {
        key: testCase.new,
      };
      const oldObject = {
        key: testCase.old,
      };
      const formattedDiffs = updateDifferenceGatherer
        .formatMessage(newObject, oldObject).split('\n');
      expect(formattedDiffs.length).to.equal(7);
      expect(formattedDiffs[0]).to.equal(' * key was updated from ');
      expect(formattedDiffs[1]).to.equal(`> ${oldObject.key.replace(/[\n\r]+/, ' ')}`);
      expect(formattedDiffs[2]).to.equal('');
      expect(formattedDiffs[3]).to.equal(' to ');
      expect(formattedDiffs[4]).to.equal(`> ${newObject.key.replace(/[\n\r]+/, ' ')}`);
      expect(formattedDiffs[5]).to.equal('');
      expect(formattedDiffs[6]).to.equal('');
    });
  });
});
