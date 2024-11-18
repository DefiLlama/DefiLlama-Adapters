const { getLogs } = require('../helper/cache/getLogs')
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { ZERO_ADDRESS } = require('../domfi/registry');

const configs = [
  {factory: "0xCd7a0227Bc48b1c14C5a1A6a4851010f80943476", fromBlock: 63905},
  {factory: "0xBcace40e446b06E6A530D945eFbae222f84fA836", fromBlock: 3633933}
]

const tvl = async (api) => {
  const logs = []
  for (const { factory, fromBlock } of configs) {
    logs.push(await getLogs({
      api,
      target: factory,
      topics: ['0x8409923236a093dc9b93970d1428b15e2c21c325f3480269492056cdd1134023'],
      eventAbi: 'event TokenCreated (address indexed token, address indexed bondingCurve, address indexed creator, string name, string symbol, address router, uint256 initialVirtualAPE, uint256 finalVirtualAPE, uint8 tradeFeePercent, uint8 apxSuccessFee, uint8 creatorSuccessFee)',
      onlyArgs: true,
      fromBlock,
    }))
  }
  let pools = logs.flat().map(log => log.bondingCurve)
  const calls = pools.map(pool => [{ target: pool }, { target: pool }]).flat()

  const ethBalances = await sdk.api.eth.getBalances({
    targets: pools,
    chain: 'apechain',
  });
  let balance = new BigNumber(0);
  ethBalances.output.forEach((ethBalance) => {
    balance = balance.plus(ethBalance.balance);
  });
  return { ['apecoin']: balance / 1e18 };
}

module.exports = {
  apechain: {
    tvl,
  }
}