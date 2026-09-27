const { sumTokens2 } = require('../helper/unwrapLPs')

const ROBINHOOD_VAULTS = [
  '0x07c688E3C1d606edc7Fe428862C08c3FA9aAEb3B',
]
const UNI_NFT_ROBINHOOD = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3'

// Position IDs the vault tracks AND actually holds. The vault's allTokenIds() list is kept in sync with
// custody on-chain (positions are burned and untracked in the same transaction), but we still verify every
// ID with ownerOf on the NonfungiblePositionManager so the reported TVL never depends on that list alone.
// A burned ID makes ownerOf revert; permitFailure turns that into null and the ID is dropped.
async function vaultHeldPositionIds(api) {
  const positionIds = []
  for (const vault of ROBINHOOD_VAULTS) {
    const ids = ((await api.call({
      target: vault,
      abi: 'function allTokenIds() view returns (uint256[])',
    })) || []).map(String)
    if (!ids.length) continue
    const owners = await api.multiCall({
      target: UNI_NFT_ROBINHOOD,
      abi: 'function ownerOf(uint256) view returns (address)',
      calls: ids,
      permitFailure: true,
    })
    ids.forEach((id, i) => {
      if (owners[i] && owners[i].toLowerCase() === vault.toLowerCase()) positionIds.push(id)
    })
  }
  return positionIds
}

async function robinhoodTvl(api) {
  const positionIds = await vaultHeldPositionIds(api)
  if (!positionIds.length) return
  await sumTokens2({
    api,
    uniV3ExtraConfig: {
      positionIds,
      nftAddress: UNI_NFT_ROBINHOOD,
    },
  })
}

module.exports = {
  methodology:
    'Sums the Uniswap V3 LP NFTs held by QuantumPools vaults on Robinhood Chain: position IDs are read from each vault (allTokenIds), kept only if ownerOf on the NonfungiblePositionManager confirms the vault holds them, then unwrapped to their underlying tokens. Double-counted vs underlying DEX liquidity.',
  doublecounted: true,
  robinhood: { tvl: robinhoodTvl },
}
