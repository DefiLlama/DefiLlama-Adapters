const utils = require('./helper/utils');
const BigNumber = require("bignumber.js");
const web3 = require('./config/web3.js');
const abis = require('./config/lido/abis.js')

async function fetch() {
  var contracts = ['0xae7ab96520de3a18e5e111b5eaab095312d7fe84'];

  let price_feed = await utils.getPricesfromString('ethereum');

  let tvl = 0;
  await Promise.all(
    contracts.map(async (contract) => {
      let dacontract = new web3.eth.Contract(abis.abis.lido, contract)
      let balances = await dacontract.methods.getTotalPooledEther().call();
      let lidoBalance = new BigNumber(balances).div(10 ** 18).toFixed(2);
      tvl += (parseFloat(lidoBalance) * price_feed.data.ethereum.usd)
    })
  )
  let { total_bond_amount } = (
    await utils.fetchURL("https://lcd.terra.dev/wasm/contracts/terra1mtwph2juhj0rvjz7dy92gvl6xvukaxu8rfv8ts/store?query_msg=%7B%22state%22%3A%20%7B%7D%7D")
  ).data.result;

  let { amount } = (
    await utils.fetchURL("https://lcd.terra.dev/market/swap?offer_coin=1000000uluna&ask_denom=uusd")
  ).data.result;

  tvl += Math.floor(
    (amount * 1.0 / 1000000) * (total_bond_amount / 1000000)
  );

  return tvl;
}


module.exports = {
  fetch
}
