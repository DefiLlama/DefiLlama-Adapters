const utils = require("../helper/utils");

const fetch = async () => {
  const tvl = (await utils.fetchURL("https://api.defily.io/v1/statistics")).data.payload.totalValueLocked.total;
  return tvl;
};

module.exports = {
  fetch,
};
