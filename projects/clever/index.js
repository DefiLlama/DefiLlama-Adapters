const sdk = require("@defillama/sdk");
const commonAbi = require("./abis/index.json")
const { default: BigNumber } = require("bignumber.js");
const { createIncrementArray, fetchURL } = require('../helper/utils');
const config = require("./config")
const lockCvxAddress = '0x96C68D861aDa016Ed98c30C810879F9df7c64154';
const cvxAddress = "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B";
const chain = 'ethereum';

async function farmTvl(balances, block) {
  const { output: gaugeTotalSupplies } = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    calls: config.pools.map(i => ({ target: i.addresses.gauge })),
    block,
  })
  gaugeTotalSupplies.forEach((item, i) => {
    const lpToken = config.pools[i].addresses.lpToken
    sdk.util.sumSingleBalance(balances, lpToken, item.output, chain)
  })
}

async function getClevers(balances, block) {
  const { output: yieldStrategiesInfos } = await sdk.api.abi.multiCall({
    abi: commonAbi.yieldStrategies,
    calls: config.clevers.map(i => ({ target: i.metaCleverAddress, params: i.indice })),
    block,
  })
  yieldStrategiesInfos.forEach((item, i) => {
    const underlyingToken = item.output.underlyingToken
    const underlying = item.output.expectedUnderlyingTokenAmount
    sdk.util.sumSingleBalance(balances, underlyingToken, underlying, chain)
  })

}

async function tvl(timestamp, block) {
  let balances = {}
  await farmTvl(balances, block)
  await getClevers(balances, block)
  const totalLockedGlobal = (await sdk.api.abi.call({
    target: lockCvxAddress,
    block,
    abi: "uint128:totalLockedGlobal",
  })).output
  if (!BigNumber(totalLockedGlobal).isZero()) {
    sdk.util.sumSingleBalance(balances, cvxAddress, BigNumber(totalLockedGlobal).toFixed(0))
  }
  return balances
}
module.exports = {
  ethereum: {
    tvl
  }
}
