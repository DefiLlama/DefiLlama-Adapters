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

  return tvl;
}


module.exports = {
  fetch
}
