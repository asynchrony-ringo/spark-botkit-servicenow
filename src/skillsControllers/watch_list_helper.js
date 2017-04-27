const watchListHelper = {
  addUserToWatchList: (userId, watchList) => {
    if (!watchList || watchList === '') {
      return userId;
    } else if (watchList.includes(userId)) {
      return watchList;
    }
    return `${watchList},${userId}`;
  },
};

module.exports = watchListHelper;
