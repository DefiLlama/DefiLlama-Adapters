const xrpl = require("xrpl");
const ADDRESSES = require('../helper/coreAssets.json');
// const xrpTBILL = 'rJNE2NNz83GJYtWVLwMvchDWEon3huWnFn'

async function rippleTvl(api) {
  const client = new xrpl.Client('wss://xrplcluster.com/');
  await client.connect();

  const issuerAddress = "rJNE2NNz83GJYtWVLwMvchDWEon3huWnFn";
  const subscriptionOperatorAddress = "rB56JZWRKvpWNeyqM3QYfZwW4fS9YEyPWM";

  const issuerAccountInfo = await client.request({
    command: 'gateway_balances',
    account: issuerAddress,
    hotwallet: [subscriptionOperatorAddress],
  });

  const totalTBLXrplCirculatingSupply = Number(issuerAccountInfo.result.obligations?.TBL)|| 0;
  api.add(ADDRESSES.ethereum.USDC, totalTBLXrplCirculatingSupply * 10 ** 6, { skipChain: true })
  client.disconnect();
}

module.exports = {
  rippleTvl
}

