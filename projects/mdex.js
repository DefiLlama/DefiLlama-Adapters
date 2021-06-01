const utils = require("./helper/utils");

async function fetch() {
  let total_tvl = await utils.fetchURL(
    "https://gateway.mdex.cc/v2/mdex/charts"
  );

  return total_tvl.data.result.total_chain_tvl;
}

module.exports = {
  fetch,
};
