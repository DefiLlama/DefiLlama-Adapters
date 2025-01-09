const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const commonAbi = require("./abis/index.json")
const config = require("./config")

const lockCvxAddress = '0x96C68D861aDa016Ed98c30C810879F9df7c64154';

async function pool2(_, _1, _2, { api, balances = {}}) {
  const gaugeTotalSupplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: config.pools.map(i => ({ target: i.addresses.gauge })),
  })
  gaugeTotalSupplies.forEach((item, i) => {
    const lpToken = config.pools[i].addresses.lpToken
    sdk.util.sumSingleBalance(balances, lpToken, item, api.chain)
  })
  return balances
}

async function getClevers(balances, api) {
  const yieldStrategiesInfos = await api.multiCall({
    abi: commonAbi.yieldStrategies,
    calls: config.clevers.map(i => ({ target: i.metaCleverAddress, params: i.indice })),
  })
  yieldStrategiesInfos.forEach((item, i) => {
    const underlyingToken = item.underlyingToken
    const underlying = item.expectedUnderlyingTokenAmount
    sdk.util.sumSingleBalance(balances, underlyingToken, underlying, api.chain)
  })
}

async function tvl(api) {
  let balances = {}
  const [totalLockedGlobal] = await Promise.all([
    api.call({
      target: lockCvxAddress,
      abi: "uint128:totalLockedGlobal",
    }),
    getClevers(balances, api),
  ])
  sdk.util.sumSingleBalance(balances, ADDRESSES.ethereum.CVX, totalLockedGlobal)
  return balances
}

module.exports = {
  ethereum: {
    tvl,
    pool2,
  }
}
