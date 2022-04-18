const { sumTokens } = require('./helper/unwrapLPs')
const { getFixBalances } = require('./helper/portedTokens')

const chain = 'godwoken'
const poolInfo = {
  '0x78E49eA628B03955eadAAA00FA9D9539A8Ef9fff': [   // USDC|bsc↔USDC|eth
    '0xC3b946c53E2e62200515d284249f2a91d9DF7954',
    '0xA21B19d660917C1DE263Ad040Ba552737cfcEf50',
  ],
  '0xfC098093240164424d6F487b43b04b2A6f5C87E1': [   //  USDT|eth↔USDC|eth
    '0x07a388453944bB54BE709AE505F14aEb5d5cbB2C',
    '0xC3b946c53E2e62200515d284249f2a91d9DF7954',
  ],
  '0x210698e5038408c189835574c296c2E2D5e57863': [   //  USDT|eth↔USDT|bsc
    '0x07a388453944bB54BE709AE505F14aEb5d5cbB2C',
    '0x5C30d9396a97f2279737E63B2bf64CC823046591',
  ],
  '0x8770CfAEC8674948Fa6301E7686A8bBb404766Be': [   //  BTCB|bsc↔WBTC|eth
    '0x7818FA4C71dC3b60049FB0b6066f18ff8c720f33',
    '0x3f8d2b24C6fa7b190f368C3701FfCb2bd919Af37',
  ],
}

async function tvl(ts, _block, chainBlocks) {
  const balances = {}
  const fixBalances = await getFixBalances(chain)
  const tokensAndOwners = []
  Object.keys(poolInfo).forEach(owner => {
    poolInfo[owner].forEach(token => tokensAndOwners.push([token, owner]))
  })
  await sumTokens(balances, tokensAndOwners, chainBlocks[chain], chain)
  return fixBalances(balances)
}

module.exports = {
  godwoken: {
    tvl
  }
}