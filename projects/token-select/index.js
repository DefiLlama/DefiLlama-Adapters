const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

// token.select — fair-launch launchpad on Robinhood Chain.
//
// Every launch deploys its own token through the factory below and seeds two Uniswap V3 1% pools:
// one against WETH and one against $SELECT. Both LP positions are custodied by an lpVault contract
// rather than by the token itself, so TVL is the value of the whitelisted (WETH) side of the V3
// positions those vaults hold — the same treatment other launchpads on this chain get.
//
// The vault address is read per token rather than hardcoded. Today every launch shares one vault,
// but the factory exposes deployLpVault(), so a later launch can be pointed at a new one; reading
// it per token means a second vault is picked up automatically instead of silently under-reporting.
const FACTORY = '0xA94AA60e9c7f193BF678608D5837F0FD51794635'

// First NewTokenSelectToken emitted by the production factory, 2026-08-04.
// https://robinhoodchain.blockscout.com/block/27657019
const FROM_BLOCK = 27657019

// Uniswap V3 NonfungiblePositionManager on Robinhood Chain.
const NFT_MANAGER = '0x73991a25c818bf1f1128deaab1492d45638de0d3'

const NEW_TOKEN =
  'event NewTokenSelectToken(address indexed tokenAddress, address indexed creator, string name, string symbol, uint256 targetETHRaise, uint256 migrationFee, uint256 deploymentFee)'

async function tvl(api) {
  const logs = await getLogs2({ api, factory: FACTORY, eventAbi: NEW_TOKEN, fromBlock: FROM_BLOCK })
  const tokens = logs.map((log) => log.tokenAddress)
  if (!tokens.length) return {}

  const vaults = await api.multiCall({ abi: 'address:lpVault', calls: tokens, permitFailure: true })
  const owners = [...new Set(vaults.filter((vault) => vault && vault !== ADDRESSES.null))]
  if (!owners.length) return {}

  return sumTokens2({
    api,
    owners,
    resolveUniV3: true,
    uniV3WhitelistedTokens: [ADDRESSES.robinhood.WETH],
    uniV3ExtraConfig: { nftAddress: NFT_MANAGER },
  })
}

module.exports = {
  doublecounted: true, // the same liquidity is already counted as Uniswap V3 TVL
  methodology:
    'TVL is the WETH side of the Uniswap V3 positions held by token.select lpVaults. Launched tokens are enumerated from the factory\'s NewTokenSelectToken events and each token\'s lpVault is read on-chain, so vaults added later are included automatically. Only the whitelisted WETH side is counted, matching the other launchpads on this chain: the launched-token side and the token/$SELECT pools are excluded, so this understates total liquidity in the pools.',
  robinhood: { tvl },
}
