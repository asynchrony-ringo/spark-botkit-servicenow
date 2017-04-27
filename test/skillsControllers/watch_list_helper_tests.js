const expect = require('chai').expect;
const watchListHelper = require('../../src/skillsControllers/watch_list_helper.js');

describe('watch list parser', () => {
  it('should return watch list with only user id if initial watch list is undefined', () => {
    const watchList = watchListHelper.addUserToWatchList('1234', undefined);
    expect(watchList).to.equal('1234');
  });

  it('should return watch list with only user id if initial watch list is empty', () => {
    const watchList = watchListHelper.addUserToWatchList('1234', '');
    expect(watchList).to.equal('1234');
  });

  it('should return watch list with correct users if initial watch list contains a single different user', () => {
    const watchList = watchListHelper.addUserToWatchList('1234', '2345');
    expect(watchList).to.equal('2345,1234');
  });

  it('should return watch list with correct users if initial watch list contains multiple different users', () => {
    const watchList = watchListHelper.addUserToWatchList('1234', '2345,3456');
    expect(watchList).to.equal('2345,3456,1234');
  });

  it('should not add a user more than once to the watch list', () => {
    const watchList = watchListHelper.addUserToWatchList('1234', '1234');
    expect(watchList).to.equal('1234');
  });
});
