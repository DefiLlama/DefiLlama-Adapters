const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

async function tvl(api) {
  const ownerTokens = []
  const poolInfo = await getConfig('ellipsis', 'https://api.ellipsis.finance/api/getPoolsCrypto')
  const lpTokens = poolInfo.data.allPools.map(i => i.lpToken.address.toLowerCase())
  poolInfo.data.allPools.map(pool => {
    ownerTokens.push([pool.tokens.map(i => i.erc20address ?? i.address), pool.address])
  })

  ownerTokens.push([[nullAddress], '0xfd4afeac39da03a05f61844095a75c4fb7d766da'])
  return sumTokens2({ api, ownerTokens, blacklistedTokens: lpTokens })
}

async function staking(api) {
  const stakingContract = "0x4076cc26efee47825917d0fec3a79d0bb9a6bb5c"
  const eps = "0xa7f552078dcc247c2684336020c03648500c6d9f"
  const locked = await api.call({ target: stakingContract, abi: 'uint256:lockedSupply' })
  api.add(eps, locked)
}

module.exports = {
  bsc: {
    tvl,
    staking
  }
}