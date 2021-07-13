const utils = require('./helper/utils');

async function fetch() {

  let tvl = 0;
  let price_feed = await utils.getPricesfromString('ethereum');

  let stake = '0x3b6c03b232f87aee2ea6561ec7bf080a7710d667';
  let ethBalance = await utils.returnEthBalance(stake);

  const enzymeFund = await utils.fetchURL("https://data.enzyme.finance/api/fund/metrics/current?address=0x86fb84e92c1eedc245987d28a42e123202bd6701")
  ethBalance += enzymeFund.data.data.calculations.ETH.gav

  tvl += (ethBalance * price_feed.data.ethereum.usd);
  return tvl;

}


module.exports = {
  fetch
}
