const watchListHelper = {
  addUserToWatchList: (userId, watchList) => {
    const watchListArray = watchList ? watchList.split(',') : [];
    if (watchListArray.indexOf(userId) === -1) {
      watchListArray.push(userId);
    }
    return watchListArray.join(',');
  },
};

module.exports = watchListHelper;
