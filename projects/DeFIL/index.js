const {fetchURL} = require("../helper/utils");

const fetch = async () => {
  let result = await fetchURL("https://api.defil.org/chainInfo/tvl");
  const tvl = result.data.tvl;
  return tvl;
};

module.exports = {
  fetch,
};