const ADDRESSES = require('../projects/helper/coreAssets.json')
const { sumTokens2 } = require('../projects/helper/unwrapLPs')
const { buildProtocolExports } = require('./utils')

// txBridge shared-bridge custody addresses on Ethereum L1
const _target = '0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB'
const _targetV2 = '0xbeD1EB542f9a5aA6419Ff3deb921A372681111f6'
const gasQuery = ADDRESSES.linea.WETH_1
const gasAddress = ADDRESSES.null

async function txBridgeTvl(api, { chainId, target = _target, additionalBridges = [], extraTokens } = {}) {
  const totalBalances = await sumTokens2({ api, owner: target, fetchCoValentTokens: true, balances: {}, tokens: extraTokens })
  const tokens = Object.keys(totalBalances).map(token => token.split(':')[1]).filter(token => token !== gasAddress)
  tokens.unshift(gasQuery)
  const balances = (await api.multiCall({
    target,
    calls: tokens.map(token => ({ params: [chainId, token] })),
    abi: 'function chainBalance(uint256 chainId, address l1Token) view returns (uint256 balance)',
    permitFailure: true,
  })).map(i => i ?? 0)
  tokens[0] = gasAddress
  api.add(tokens, balances)

  for (const bridge of additionalBridges)
    await txBridgeTvl(api, { chainId, target: bridge })
  return api.getBalances()
}

async function txBridgeTvlV2(api, { chainId, target = _targetV2, additionalBridges = [], extraTokens } = {}) {
  const totalBalances = await sumTokens2({ api, owner: target, fetchCoValentTokens: true, balances: {}, tokens: extraTokens })
  const tokens = Object.keys(totalBalances).map(token => token.split(':')[1]).filter(token => token !== gasAddress)
  tokens.unshift(gasQuery)
  const assetIds = await api.multiCall({ abi: 'function assetId(address) view returns (bytes32)', calls: tokens, target, permitFailure: true })
  const tokensWithIds = tokens.filter((_token, i) => assetIds[i])
  const assetIdsLegit = assetIds.filter((id) => id)

  const chainBalanceAbi = 'function chainBalance(uint256 chainId, bytes32 assetId) view returns (uint256 balance)'
  const calls = assetIdsLegit.map(token => ({ params: [chainId, token] }))
  const balances = (await api.multiCall({ target, calls, abi: chainBalanceAbi, permitFailure: true })).map(i => i ?? 0)
  tokensWithIds[0] = gasAddress
  api.add(tokensWithIds, balances)

  // since the Nov 2026 vault upgrade, per-chain balances migrate from the vault to the L1AssetTracker; the migration
  // moves the balance, so summing both covers chains before, during and after it
  const assetTracker = await api.call({ abi: 'address:l1AssetTracker', target, permitFailure: true })
  if (assetTracker && assetTracker !== gasAddress) {
    const trackerBalances = (await api.multiCall({ target: assetTracker, calls, abi: chainBalanceAbi, permitFailure: true })).map(i => i ?? 0)
    api.add(tokensWithIds, trackerBalances)
  }

  for (const bridge of additionalBridges)
    await txBridgeTvl(api, { chainId, target: bridge })
  return api.getBalances()
}

// GRVT holds additional tokens earning yield in an on-chain vault
const GRVT_VAULT = '0xC95Fedb8Bdc763e4ef093D14e8196afafBB48f45'
async function grvtVaultTvl(api) {
  const tokens = await api.call({ abi: 'function getTrackedTvlTokens() view returns (address[])', target: GRVT_VAULT })
  const bals = await api.multiCall({ abi: 'function tokenTotals(address queryToken) view returns (uint256 idle, uint256 strategy, uint256 total)', calls: tokens, target: GRVT_VAULT, field: 'total' })
  api.add(tokens, bals)
}

// GRVT L1 compartments: one contract per GRVT vault, created by the compartment registry. Each holds funds bridged
// out of GRVT and the receipt tokens of the venues it lends to. Every token is reported at its raw balanceOf and
// priced by DefiLlama; nothing is converted with GRVT's own rates. The holdings reader lists, per compartment, each
// listed venue's receipt token and underlying (delisted venues stay listed until empty). USDC and USDT are added so
// idle funds in a compartment with no venues are counted too.
const GRVT_COMPARTMENT_REGISTRY = '0x55e271ae274BE015Fc46cdf43a2C7C96eF1dFB89'
const GRVT_COMPARTMENT_READER = '0x9D673635b63ca5A550eBb1cA3e0F7765CB434162'
const GRVT_COMPARTMENT_REGISTRY_BLOCK = 26306312 // registry deployment; the first compartment came later
async function grvtCompartmentTvl(api) {
  if (await api.getBlock() < GRVT_COMPARTMENT_REGISTRY_BLOCK) return
  const count = await api.call({ abi: 'uint256:compartmentCount', target: GRVT_COMPARTMENT_REGISTRY })
  const infos = await api.multiCall({
    abi: 'function compartmentAt(uint256) view returns (address compartment, uint8 entityType, uint256 entityId)',
    calls: Array.from({ length: Number(count) }, (_, i) => i),
    target: GRVT_COMPARTMENT_REGISTRY,
  })
  const compartments = infos.map(i => i.compartment)
  const tracked = await api.multiCall({ abi: 'function trackedTokens(address) view returns (address[])', calls: compartments, target: GRVT_COMPARTMENT_READER })
  const tokensAndOwners = compartments.flatMap((owner, i) =>
    [...new Set([...tracked[i], ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT].map(t => t.toLowerCase()))].map(token => [token, owner]))
  await sumTokens2({ api, tokensAndOwners })
}

async function grvtL1Tvl(api) {
  await grvtVaultTvl(api)
  await grvtCompartmentTvl(api)
}

// zkSync-stack (Elastic Chain) forks whose L1 TVL is custodied in the txBridge shared bridge.
function txBridgeExportFn(chainConfigs) {
  const result = {}
  Object.entries(chainConfigs).forEach(([chain, config]) => {
    const { chainId, target, additionalBridges, extraTokens, extraTvl, blacklistedTokens = [] } = config
    result[chain] = {
      tvl: async (api) => {
        await txBridgeTvlV2(api, { chainId, target, additionalBridges, extraTokens })
        if (extraTvl) await extraTvl(api)
        blacklistedTokens.forEach(token => api.removeTokenBalance(token))
        return api.getBalances()
      },
    }
  })
  return result
}

// key = DefiLlama protocol slug; value.ethereum holds the bridge config
const configs = {
  'txBridge': { ethereum: { chainId: 324 } },
  'abstract': { ethereum: { chainId: 2741 } },
  'cronos-zk': { ethereum: { chainId: 388 } },
  'zkcandy': { ethereum: { chainId: 320 } },
  'grvt-io': { ethereum: { chainId: 325, blacklistedTokens: ['0xAD29F2723fcdBcF665F210F25E06f97477e417cF'], extraTvl: grvtL1Tvl } },
  'lens': { ethereum: { chainId: 232 } },
  'openzk': { ethereum: { chainId: 1345 } },
  'treasure': { ethereum: { chainId: 61166 } },
  'adi-bridge': { ethereum: { chainId: 36900, target: '0x0a0f8912162ff83a036883dbada42eff647a3065' } },
  'zero_network': { ethereum: { chainId: 543210 } },
  'sophon': {
    ethereum: {
      chainId: 50104,
      additionalBridges: ['0xf553E6D903AA43420ED7e3bc2313bE9286A8F987'],
      extraTokens: [
        '0xc96Aa65F31E41b4Ca6924B86D93e25686019E59C',
        '0x996d67aa9b37df96428ad3608cb21352bf1fdb90',
      ],
    },
  },
}

module.exports = buildProtocolExports(configs, txBridgeExportFn)
