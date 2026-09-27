const { sumTokens2 } = require('../helper/unwrapLPs')

const ROBINHOOD_VAULTS = [
  '0x07c688E3C1d606edc7Fe428862C08c3FA9aAEb3B',
]
const UNI_NFT_ROBINHOOD = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3'

async function robinhoodTvl(api) {
  const tokenIds = []
  for (const vault of ROBINHOOD_VAULTS) {
    const ids = await api.call({
      target: vault,
      abi: 'function allTokenIds() view returns (uint256[])',
    })
    tokenIds.push(...(ids || []).map(String))
  }
  if (!tokenIds.length) return
  await sumTokens2({
    api,
    uniV3ExtraConfig: {
      positionIds: tokenIds,
      nftAddress: UNI_NFT_ROBINHOOD,
    },
  })
}

module.exports = {
  methodology:
    'Sums Uniswap V3 LP NFTs held by QuantumPools vaults on Robinhood Chain (allTokenIds → NonfungiblePositionManager unwrap). Double-counted vs underlying DEX liquidity.',
  doublecounted: true,
  robinhood: { tvl: robinhoodTvl },
}
