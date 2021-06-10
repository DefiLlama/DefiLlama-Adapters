const utils = require("./helper/utils");

/* * * * * * * *
 * ==> Correct adapter needs to be created.
 *
 *****************/

async function fetch() {
  let eth = await utils.fetchURL(
    "https://api.badger.finance/v2/value?chain=eth"
  );
  let bsc = await utils.fetchURL(
    "https://api.badger.finance/v2/value?chain=bsc"
  );
  return eth.data.totalValue + bsc.data.totalValue;
}

module.exports = {
  fetch,
};
