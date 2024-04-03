const sdk = require('@defillama/sdk')
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const { getLogs } = require('../helper/cache/getLogs')
const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs')


async function getTVL(api, borrowed) {
  const PoolFactory = '0x55F9F26b3d7a4459205c70994c11775629530eA5'
  const logs = await getLogs({
    api,
    target: PoolFactory,
    fromBlock: 15819910,
    topic: 'PoolCreated(address,address,address)',
  })
  const owners = logs.map(i => `0x${i.data.substring(26, 66)}`)
  const totalBorrowed = await api.multiCall({
    calls: owners.map(pool => ({target: pool})),
    abi: abi.totalBorrowed,
  })
  const balances = {}
  if (borrowed) {
    balances[nullAddress] = BigNumber(0);
    for (let pool of totalBorrowed) {
      balances[nullAddress] = balances[nullAddress].plus(pool)
    }
    return balances
  }
  await sumTokens2({ api, tokens: [nullAddress], owners, balances, })
  return balances
}
async function borrowed(api) {
  return await getTVL(api, true)
}
async function tvl(api) {
  return await getTVL(api, false)
}

module.exports = {
    start: 1666638251,
  methodology: 'TVL is calculated by adding up all the ETH in the pools and the totalBorrowed of every pool',
  ethereum: {
    tvl: tvl,
    borrowed: borrowed
  }
}