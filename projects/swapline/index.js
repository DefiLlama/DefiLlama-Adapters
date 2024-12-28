const { joeV2Export } = require('../helper/traderJoeV2')

module.exports = joeV2Export({
  fantom: '0x640801a6983c109805E928dc7d9794080C21C88E',
  optimism: '0xd08C98F6409fCAe3E61f3157B4147B6595E60cf3',
  polygon_zkevm: '0x5A5c0C4832828FF878CE3ab4fEc44d21200b1496',
  arbitrum: '0xEE0616a2DEAa5331e2047Bc61E0b588195A49cEa',
  base: '0x5A5c0C4832828FF878CE3ab4fEc44d21200b1496',
  shimmer_evm: '0xEE0616a2DEAa5331e2047Bc61E0b588195A49cEa',
})

module.exports.hallmarks = [
  [1682298000, "Launch on Optimism"],
  [1689037200, "Launch on Arbitrum"],
  [1690848000, "Launch on Base"],
  [1702857600, "Launch on ShimmerEVM"]
]