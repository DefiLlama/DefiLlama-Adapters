const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Frontier (frontier.fun) — token launchpad on Robinhood Chain (4663), two deployments.
//
// tvl:
//   - Curve ETH. Each un-graduated token custodies the native ETH its own curve raises
//     (verified: reserveBalance - VIRTUAL_BALANCE equals the token's ETH balance to the
//     wei). When the curve fills, the token pays the creator fee and seeds a Uniswap V4
//     pool in the same transaction, leaving its balance at zero. v1.2 direct-seed
//     launches skip the curve and never hold ETH.
//   - Locked seed liquidity (v1.2). Every pool's seed position NFT is minted straight to
//     the Harvester, which can only collect fees from it — the liquidity is locked for
//     good. Counted as the ETH leg of those positions; the coin leg is the launched
//     token's own unsold supply and is not counted. This liquidity is also in the
//     uniswap-v4 adapter's TVL on this chain, hence `doublecounted`.
// staking:
//   - Coins deposited in Frontier's ERC-4626 StakingVaults (one per coin, deployed by
//     the StakingVaultFactory), including deposits sitting in a vault's cooldown holder
//     while a withdrawal matures. The WETH a vault holds is rewards, not deposits.
const V1_FACTORY = '0x3cbC9395046607C083B383DC3588A3e8308dFf54'
const V1_FROM_BLOCK = 23650298 // first v1 CoinDeployed
const V12_FACTORY = '0xe3A826C056e578c240D362BF4C2fa53E5c0c17a5'
const V12_FROM_BLOCK = 36671438 // v1.2 deploy block
const HARVESTER = '0x2F33cb57fAa8bF1EB52ea18D90B0dc2f8cc2Db1f'
const POSITION_MANAGER = '0x58daec3116aae6d93017baaea7749052e8a04fa7' // Uniswap V4 posm
const STAKING_VAULT_FACTORY = '0xFB443f5c6Ba35334a1AB2Fc12d4b877fc2A8d6A9'

const V1_COIN_DEPLOYED_EVENT = 'event CoinDeployed(address indexed creator, address indexed token, address factory, address lp, string name, string symbol, string description, string image, uint256 initialSupply, uint256 maxSupply, uint256 initialETHReserves, uint256 initialPrice, uint256 initialMarketCap, uint256 targetETH)'
const V12_COIN_DEPLOYED_EVENT = 'event CoinDeployed(address indexed creator, address indexed token, address factory, address lp, string name, string symbol, string description, string image, uint256 initialSupply, uint256 maxSupply, uint256 initialETHReserves, uint256 initialPrice, uint256 initialMarketCap, uint256 targetETH, bool indexed directSeed)'
const VAULT_DEPLOYED_EVENT = 'event VaultDeployed(address indexed asset, address indexed vault, uint256 cooldownDuration)'
const NFT_TRANSFER_EVENT = 'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
const NFT_TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const asTopic = (address) => '0x' + address.slice(2).toLowerCase().padStart(64, '0')

/**
 * Native ETH custodied by un-graduated bonding-curve tokens (v1 + v1.2
 * factories, enumerated from CoinDeployed; direct-seed launches never hold
 * ETH), plus the ETH leg of the permanently locked Uniswap V4 seed positions
 * held by the Harvester. The coin leg of those positions is the launched
 * token's own unsold supply and is not counted.
 * @param {object} api - DefiLlama chain api for the block being measured
 */
async function tvl(api) {
  const [v1Launches, v12Launches, positionTransfers] = await Promise.all([
    getLogs2({ api, factory: V1_FACTORY, eventAbi: V1_COIN_DEPLOYED_EVENT, fromBlock: V1_FROM_BLOCK }),
    getLogs2({ api, factory: V12_FACTORY, eventAbi: V12_COIN_DEPLOYED_EVENT, fromBlock: V12_FROM_BLOCK }),
    // Seed positions are minted to the Harvester and never leave it, so every
    // position NFT ever sent there is one it still holds; ownerOf below is only
    // a guard against that assumption breaking.
    getLogs2({
      api,
      target: POSITION_MANAGER,
      eventAbi: NFT_TRANSFER_EVENT,
      topics: [NFT_TRANSFER_TOPIC, null, asTopic(HARVESTER)],
      fromBlock: V12_FROM_BLOCK,
      extraKey: 'harvester-positions',
    }),
  ])

  const curveTokens = [
    ...v1Launches.map((log) => log.token),
    ...v12Launches.filter((log) => !log.directSeed).map((log) => log.token),
  ]
  await api.sumTokens({ tokensAndOwners: curveTokens.map((token) => [ADDRESSES.null, token]) })

  const positionIds = [...new Set(positionTransfers.map((log) => log.tokenId.toString()))]
  if (!positionIds.length) return
  const owners = await api.multiCall({
    target: POSITION_MANAGER,
    abi: 'function ownerOf(uint256 tokenId) view returns (address)',
    calls: positionIds,
    permitFailure: true,
  })
  const lockedPositionIds = positionIds.filter((_, i) => owners[i]?.toLowerCase() === HARVESTER.toLowerCase())
  if (!lockedPositionIds.length) return

  return sumTokens2({
    api,
    resolveUniV4: true,
    uniV4ExtraConfig: {
      positionIds: lockedPositionIds,
      whitelistedTokens: [ADDRESSES.null],
    },
  })
}

/**
 * Coins deposited in Frontier's ERC-4626 StakingVaults (one per coin,
 * enumerated from VaultDeployed), including deposits parked in each vault's
 * cooldown holder while a withdrawal matures. The WETH a vault holds is
 * rewards, not deposits, and is not counted.
 * @param {object} api - DefiLlama chain api for the block being measured
 */
async function staking(api) {
  const vaults = await getLogs2({ api, factory: STAKING_VAULT_FACTORY, eventAbi: VAULT_DEPLOYED_EVENT, fromBlock: V12_FROM_BLOCK })
  if (!vaults.length) return
  const cooldownHolders = await api.multiCall({ abi: 'address:cooldownHolder', calls: vaults.map((log) => log.vault) })
  const tokensAndOwners = vaults.flatMap((log, i) => [
    [log.asset, log.vault],
    [log.asset, cooldownHolders[i]],
  ])
  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  methodology:
    'TVL is the native ETH held by un-graduated Frontier bonding-curve tokens on Robinhood Chain (v1 and v1.2 factories, enumerated from CoinDeployed; each token custodies what its curve raises until it fills and seeds its Uniswap V4 pool), plus the ETH leg of the permanently locked Uniswap V4 seed positions held by the Harvester (v1.2; the coin leg is the launched token itself and is not counted). Staking is the coins deposited in Frontier\'s ERC-4626 StakingVaults, including deposits in cooldown. Launched tokens are not counted anywhere.',
  start: '2026-07-30',
  // The locked seed positions are Uniswap V4 liquidity, already in uniswap-v4's TVL on this chain.
  doublecounted: true,
  robinhood: { tvl, staking },
}
