const utils = require('./helper/utils');

async function fetch() {
  let tvl = 0;

  let { total_bond_amount } = (
      await utils.fetchURL("https://lcd.terra.dev/wasm/contracts/terra1mtwph2juhj0rvjz7dy92gvl6xvukaxu8rfv8ts/store?query_msg=%7B%22state%22%3A%20%7B%7D%7D")
    ).data.result;

  let { amount } = (
    await utils.fetchURL("https://lcd.terra.dev/market/swap?offer_coin=1000000uluna&ask_denom=uusd")
  ).data.result;

  tvl = Math.floor(
    (amount*1.0/1000000)*(total_bond_amount/1000000)
  );

  return tvl;
}


module.exports = {
  fetch
}