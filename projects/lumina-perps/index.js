// Lumina Perps (BNB Chain)
// TVL = USDT held by the trader margin vault, the LP vault (LLP) and every leader vault created by the factory.
// The fee collector balance is protocol revenue, not user funds, and is left out.
const ADDRESSES = require('../helper/coreAssets.json')

const VAULT = '0x9430B44187c0C6cd4DabD3c3be89B5c6B9f22272'   // LuminaVault (trader margin)
const LLP = '0xf91b7467974692E5dB27D1a99Ab7cd6dc6356438'     // LuminaLPVault (counterparty liquidity)
const FACTORY = '0xf184306a92c8d2744eaCB8acD08d1298d4b6607E' // VaultFactory (leader vaults)

async function tvl(api) {
  const leaderVaults = await api.call({ target: FACTORY, abi: 'function getAllVaults() view returns (address[])' })
  return api.sumTokens({ owners: [VAULT, LLP, ...leaderVaults], tokens: [ADDRESSES.bsc.USDT] })
}

module.exports = {
  methodology: 'USDT held on-chain by the Lumina Perps margin vault, the LP vault (LLP) and leader vaults on BNB Chain.',
  bsc: { tvl },
}
