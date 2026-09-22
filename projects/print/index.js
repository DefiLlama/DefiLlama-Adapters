const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Print (printonhood.lol): a launchpad on Robinhood Chain where every coin is paired to a real market.
// Each PrintCoin runs its own bonding market and holds that market's ETH itself; trades buy the paired
// asset (a Robinhood Chain stock token) into the coin's PrintVault, which has no owner or admin.
// There is one PrintFactory per backing market, plus the earlier SHI-backed test factory whose vault still holds assets.
const FACTORIES = [
  '0x999c124879a9D9CB8717E0A85E5c4D7453586E6d', // NVDA
  '0x534A3d7d7725b226cC7A5110Ad89D6eB850A0E0F', // TSLA
  '0x72CD1b9F2Bc8175A6416eA9983A3b96E660c268f', // GLD
  '0x995bD26540B94F755a724A814EEECD4C6E11faA8', // SPY
  '0x7a3D87181FB467d17C09cee76e654D6cfe6fE221', // SPCX
  '0x4d3CE2D0DE6F2197b0F2d56915DA4E19146893a7', // AAPL
  '0x8590CdEc87c1f6C70cE59f943D15E3e5Ff3996Cc', // QQQ
  '0xa5107e060F88b49AA88DF727c26D6c92416680D7', // GOOGL
  '0x072C7cb5855c7c0DB5a566B3E0e8A5Aa827a4e82', // MSTR
  '0x2513271927998159670495ed24f58be49630365d', // SHI (test factory)
]

const pairAbi = 'function pairs(uint256) view returns (address coin, address vault, address backing, address creator, uint64 createdAt)'

async function tvl(api) {
  const pairs = await api.fetchList({ lengthAbi: 'pairCount', itemAbi: pairAbi, targets: FACTORIES })
  // A coin's nativeReserve includes a 30 ETH virtual reserve, so its real ETH balance is read instead.
  return sumTokens2({
    api,
    tokensAndOwners: pairs.map(({ backing, vault }) => [backing, vault]),
    owners: pairs.map(({ coin }) => coin),
    tokens: [ADDRESSES.null],
  })
}

module.exports = {
  methodology: "TVL is the real assets held in Print vaults (the Robinhood stock tokens each coin is paired to) plus the ETH held in each Print coin's own market.",
  start: '2026-09-16',
  robinhood: { tvl },
}
