const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { PromisePool } = require('@supercharge/promise-pool')
const { getConfig } = require('../helper/cache')

const abis = {
  wrapped_coins: 'function wrapped_coins(uint256 arg0) view returns (address)',
  coins: 'function coins(uint256 arg0) view returns (address)'
}

async function tvl(api) {
  const ownerTokens = []
  const poolInfo = await getConfig('ellipsis', 'https://api.ellipsis.finance/api/getPoolsCrypto')
  const wrappedCoinPools = [
    '0xab499095961516f058245c1395f9c0410764b6cd',
    '0x245e8bb5427822fb8fd6ce062d8dd853fbcfabf5',
    '0xfa715e7c8fa704cf425dd7769f4a77b81420fbf2',
    '0x19ec9e3f7b21dd27598e7ad5aae7dc0db00a806d',
  ].map(i => i.toLowerCase())
  const lpTokens = poolInfo.data.allPools.map(i => i.lpToken.address.toLowerCase())
  const { errors } = await PromisePool.withConcurrency(20)
    .for(poolInfo.data.allPools)
    .process(async pool => {
      const target = pool.address.toLowerCase()
      let abi = wrappedCoinPools.includes(target) ? abis.wrapped_coins : abis.coins
      const calls = pool.tokens.map((_, i) => i)
      try {
        const tokens = await api.multiCall({ abi: abi, calls, target, })
        ownerTokens.push([tokens, target])
      } catch {
        abi = abi === abis.wrapped_coins ? abis.coins : abis.wrapped_coins
        const tokens = await api.multiCall({ abi: abi, calls, target, })
        ownerTokens.push([tokens, target])
      }
    })
  if (errors && errors.length)
    throw errors[0]

  ownerTokens.push([[nullAddress], '0xfd4afeac39da03a05f61844095a75c4fb7d766da'])
  return sumTokens2({ api, ownerTokens, blacklistedTokens: lpTokens })
}

const stakingContract = "0x4076cc26efee47825917d0fec3a79d0bb9a6bb5c"
const eps = "0xa7f552078dcc247c2684336020c03648500c6d9f"
async function staking(api) {
  const locked = await api.call({ target: stakingContract, abi: 'uint256:lockedSupply' })
  return {
    ["bsc:" + eps]: locked
  }
}

module.exports = {
  bsc: {
    tvl,
    staking
  }
}