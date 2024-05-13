const { sumTokens2 } = require('../helper/unwrapLPs')

const factories = {
  fantom: '0x640801a6983c109805E928dc7d9794080C21C88E',
  optimism: '0xd08C98F6409fCAe3E61f3157B4147B6595E60cf3',
  polygon_zkevm: '0x5A5c0C4832828FF878CE3ab4fEc44d21200b1496',
  arbitrum: '0xEE0616a2DEAa5331e2047Bc61E0b588195A49cEa',
  base: '0x5A5c0C4832828FF878CE3ab4fEc44d21200b1496',
  shimmer_evm: '0xEE0616a2DEAa5331e2047Bc61E0b588195A49cEa',
}
async function tvl(api) {
  let blacklistedTokens = []
  if (api.chain === 'fantom') blacklistedTokens = ['0xdc6ff44d5d932cbd77b52e5612ba0529dc6226f1']
  const pools = await api.fetchList({
    target: factories[api.chain],
    itemAbi: 'function getLBPairAtIndex(uint256) view returns (address)',
    lengthAbi: 'uint256:getNumberOfLBPairs',
  })
  const tokenA = await api.multiCall({
    abi: 'address:getTokenX',
    calls: pools,
  })
  const tokenB = await api.multiCall({
    abi: 'address:getTokenY',
    calls: pools,
  })
  const toa = []
  tokenA.map((_, i) => {
    toa.push([tokenA[i], pools[i]])
    toa.push([tokenB[i], pools[i]])
  })
  return sumTokens2({...api, tokensAndOwners: toa, blacklistedTokens,})
}

module.exports = {
  hallmarks: [
    [1682298000,"Launch on Optimism"],
    [1687827600,"Launch on Polygon zkEVM"],
    [1689037200,"Launch on Arbitrum"],
    [1690848000,"Launch on Base"],
    [1702857600,"Launch on ShimmerEVM"]
  ],
  methodology: 'We count the token balances in different liquidity book contracts',
  fantom:{
    tvl,
  },
  optimism:{
    tvl,
  },
  polygon_zkevm:{
    tvl,
  },
  arbitrum:{
    tvl,
  },
  base:{
    tvl,
  },
  shimmer_evm: {
    tvl,
  },
};