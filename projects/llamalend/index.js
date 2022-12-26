const sdk = require('@defillama/sdk')
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs')


async function getTVL(block, borrowed) {
  const chain = 'ethereum'
  const PoolFactory = '0x55F9F26b3d7a4459205c70994c11775629530eA5'
  const logs = await sdk.api.util.getLogs({
    keys: [],
    toBlock: block,
    target: PoolFactory,
    fromBlock: 15819910,
    topic: 'PoolCreated(address,address,address)',
  })
  const owners = logs.output.map(i => `0x${i.data.substring(26, 66)}`)
  const totalBorrowed = await sdk.api.abi.multiCall({
    calls: owners.map(pool => ({target: pool})),
    abi: abi.totalBorrowed,
    chain,
    block,
  })
  const balances = {}
  if (borrowed) {
    balances[nullAddress] = BigNumber(0);
    for (let pool of totalBorrowed.output) {
      balances[nullAddress] = balances[nullAddress].plus(pool.output)
    }
    return balances
  }
  await sumTokens2({ tokens: [nullAddress], owners, chain, block, balances, })
  return balances
}
async function borrowed(_, block) {
  return await getTVL(block, true)
}
async function tvl(_, block) {
  return await getTVL(block, false)
}

module.exports = {
  timetravel: true,
  start: 1666638251,
  methodology: 'TVL is calculated by adding up all the ETH in the pools and the totalBorrowed of every pool',
  ethereum: {
    tvl: tvl,
    borrowed: borrowed
  }
}