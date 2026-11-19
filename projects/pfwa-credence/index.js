const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

// Credence (credence.pfwa.fun, part of PFWA): a token deployer on Robinhood Chain. Every token it deploys is tied to a
// live Polymarket prediction: the token's trading fees fund the bet, and winnings buy back and burn the token.
// Only cash is counted: ETH, WETH and dollar stablecoins sitting in Credence's vault contracts.
// Not counted: Polymarket outcome shares (CTF ERC-1155 positions) held by the PolyVaults, the launched meme tokens and
// their curve / pool liquidity, $PFWA, launch fees in the launcher contracts (protocol revenue) and fees not yet
// collected from Pons.

// Robinhood Chain: every vault factory keeps an onchain list (vaultCount / allVaults)
const VAULT_FACTORIES = [
  '0x17d0f24ADbD613C046eB25c0cc054333c5481F05', // CredenceVaultFactory (v1)
  '0x099684533Dc729457650AB2424811AF9c79032D8', // CredenceVaultFactoryV2
  '0xD9e709c55Ce2680B99E982Ce1AAb24890dD39D55', // 18 Sep 2026 rehearsal factory, retired (one vault)
  '0xade0E3e0218d53A89E607F312DB9CeA2DFcC5D10', // CreatorFeeVaultFactory: creator vaults, fees held until the named X account claims
]

// Polygon
const POLY_VAULT_FACTORY_V1 = '0xC20E838e509B248638812FB3dAa1c8B63D6183C0' // keeps no list: its vaults come from PolyVaultCreated
const POLY_VAULT_FACTORY_V1_BLOCK = 93361845
const POLY_VAULT_FACTORIES = [
  '0x69CD45c4d89CA8Cfe37c2ED1F869306e031d58F9', // PolyVaultFactoryV2
  '0xD9e709c55Ce2680B99E982Ce1AAb24890dD39D55', // 18 Sep 2026 rehearsal factory, retired
]

const listVaults = (api, target) => api.fetchList({ lengthAbi: 'uint256:vaultCount', itemAbi: 'function allVaults(uint256) view returns (address)', target })

async function robinhoodTvl(api) {
  const owners = (await Promise.all(VAULT_FACTORIES.map((factory) => listVaults(api, factory)))).flat()
  return api.sumTokens({ owners, tokens: [ADDRESSES.null, ADDRESSES.robinhood.WETH, ADDRESSES.robinhood.USDG] })
}

async function polygonTvl(api) {
  const owners = await getLogs2({
    api,
    target: POLY_VAULT_FACTORY_V1,
    fromBlock: POLY_VAULT_FACTORY_V1_BLOCK,
    eventAbi: 'event PolyVaultCreated(address indexed vault, address indexed owner, bytes32 conditionId)',
    transform: (log) => log.vault,
  })
  for (const factory of POLY_VAULT_FACTORIES) {
    const vaults = await listVaults(api, factory)
    // a vault the guardian removed (e.g. one made with a leaked launcher key) is no longer part of the protocol
    const live = await api.multiCall({ abi: 'function isVault(address) view returns (bool)', target: factory, calls: vaults })
    owners.push(...vaults.filter((_, i) => live[i]))
  }
  // pUSD is Polymarket's collateral (USDC.e wrapped 1:1); USDC.e is what fees arrive in from Robinhood Chain
  return api.sumTokens({ owners, tokens: [ADDRESSES.polygon.PUSD, ADDRESSES.polygon.USDC, ADDRESSES.polygon.USDC_CIRCLE] })
}

module.exports = {
  methodology: 'Cash held by Credence vaults. Robinhood Chain: the ETH, WETH and USDG in every CredenceVault (v1, v2 and the retired rehearsal factory, listed onchain by each factory\'s vaultCount/allVaults), i.e. trading fees waiting to be bridged to the bet or used for a buyback, and in every deployed CreatorFeeVault (fees held until the named X account claims them). Polygon: the pUSD, USDC.e and USDC in every PolyVault (v1 vaults from the v1 factory\'s PolyVaultCreated events, v2 vaults from PolyVaultFactoryV2.allVaults), i.e. fees waiting to buy the outcome and winnings waiting to go home. Polymarket outcome shares (CTF ERC-1155 positions) are never counted, nor are the launched meme tokens, their curve or pool liquidity, $PFWA, or launch fees held by the launcher contracts.',
  start: '2026-09-07',
  robinhood: { tvl: robinhoodTvl },
  polygon: { tvl: polygonTvl },
}
