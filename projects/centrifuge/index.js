const ADDRESSES = require('../helper/coreAssets.json')

const nullAddress = ADDRESSES.null

const CONFIG = {
  ethereum: {
    factories : [
      { START_BLOCK: 20432393, TOKEN_FACTORY_V2: '0x91808B5E2F6d7483D41A681034D7c9DbB64B9E29' }, // v2
      { START_BLOCK: 22924277, TOKEN_FACTORY_V3: '0xd30Da1d7F964E5f6C2D9fE2AAA97517F6B23FA2B' }, // v3
    ],
    assets: { USDC: ADDRESSES.ethereum.USDC }
  },
  base: {
    factories : [
      { START_BLOCK: 17854404, TOKEN_FACTORY_V2: '0x7f192F34499DdB2bE06c4754CFf2a21c4B056994' }, // v2
      { START_BLOCK: 32901390, TOKEN_FACTORY_V3: '0xd30Da1d7F964E5f6C2D9fE2AAA97517F6B23FA2B' }, // v3
    ],
    assets: { USDC: ADDRESSES.base.USDC }
  },
  arbitrum: {
    factories : [
      { START_BLOCK: 238245701, TOKEN_FACTORY_V2: '0x91808B5E2F6d7483D41A681034D7c9DbB64B9E29' }, // v2
      { START_BLOCK: 357984300, TOKEN_FACTORY_V3: '0xd30Da1d7F964E5f6C2D9fE2AAA97517F6B23FA2B' }, // v3
    ],
    assets: { USDC: ADDRESSES.arbitrum.USDC_CIRCLE }
  },
  avax: {
    factories : [
      { START_BLOCK: 65493376, TOKEN_FACTORY_V3: '0xd30Da1d7F964E5f6C2D9fE2AAA97517F6B23FA2B' }, // v3
    ],
    assets: { USDC: ADDRESSES.avax.USDC }
  },
  bsc: {
    factories : [
      { START_BLOCK: 54801665, TOKEN_FACTORY_V3: '0xd30Da1d7F964E5f6C2D9fE2AAA97517F6B23FA2B' }, // v3
    ],
    assets: { USDC: ADDRESSES.bsc.USDC }
  },
  plume_mainnet: {
    factories : [
      { START_BLOCK: 15715268, TOKEN_FACTORY_V3: '0xd30Da1d7F964E5f6C2D9fE2AAA97517F6B23FA2B' }, // v3
    ],
    assets: { USDC: ADDRESSES.plume_mainnet.USDC }
  },
}

const abis = {
  getVault: "function vault(address asset) external view returns (address)",
  totalAssets: "function totalAssets() external view returns (uint256)",
  asset: "function asset() external view returns (address)",
};

const eventAbis = {
  deployTranches: 'event DeployTranche(uint64 indexed poolId, bytes16 indexed trancheId, address indexed tranche)',
  addShareClass: 'event AddShareClass(uint64 indexed poolId, bytes16 indexed scId, address token)'
}

const safeGetLogs = async (fn, timeoutMs = 90_000) => {
  try {
    return await new Promise((resolve) => {
      const timer = setTimeout(() => resolve([]), timeoutMs)
      Promise.resolve()
        .then(fn)
        .then((res) => {
          clearTimeout(timer)
          resolve(res)
        })
        .catch(() => {
          clearTimeout(timer)
          resolve([])
        })
    })
  } catch (e) {
    return []
  }
}

const getTokens = async (api, block, factories) => {
  const logs = await Promise.all(
    factories.map(async (factory) => {
      let allTranches = []

      if (factory.TOKEN_FACTORY_V2) {
        const tranches = await safeGetLogs(() => api.getLogs({ target: factory.TOKEN_FACTORY_V2, fromBlock: factory.START_BLOCK, toBlock: block, eventAbi: eventAbis.deployTranches, onlyArgs: true }))
        allTranches.push(...tranches.map(({ tranche }) => tranche))
      }

      if (factory.TOKEN_FACTORY_V3) {
        const shareClasses = await safeGetLogs(() => api.getLogs({ target: factory.TOKEN_FACTORY_V3, fromBlock: factory.START_BLOCK, toBlock: block, eventAbi: eventAbis.addShareClass, onlyArgs: true }))
        allTranches.push(...shareClasses.map(({ token }) => token))
      }

      return allTranches
    })
  )

  return [...new Set(logs.flat())]
}
 
const tvl = async (api) => {
  const chain = api.chain
  const block = await api.getBlock() - 100
  const { factories, assets: { USDC } } = CONFIG[chain]
  const tokens = await getTokens(api, block, factories)
  if (!tokens || !tokens.length) return;

  const vaults = (await api.multiCall({ calls: tokens.map((t) => ({ target: t, params: [USDC] })), abi: abis.getVault, permitFailure: true }))
    .filter(addr => addr && addr.toLowerCase() !== nullAddress)

  await api.erc4626Sum({ calls: vaults, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets', permitFailure: true })

  const shareClassAssets = await api.multiCall({ calls: tokens, abi: abis.asset, permitFailure: true })

  const offchainIndexes = []
  shareClassAssets.forEach((assetAddr, idx) => {
    if (!assetAddr) return
    if (assetAddr.toLowerCase() !== nullAddress) return
    offchainIndexes.push(idx)
  })

  if (!offchainIndexes.length)
    return

  const offchainTokens = offchainIndexes.map((idx) => tokens[idx])
  const [shareClassTotals, shareClassDecimals] = await Promise.all([
    api.multiCall({ calls: offchainTokens, abi: abis.totalAssets, permitFailure: true }),
    api.multiCall({ calls: offchainTokens, abi: 'erc20:decimals', permitFailure: true }),
  ])

  let offchainUsd = 0
  // Share classes with a null asset hold off-chain exposures and report their NAV directly via totalAssets
  offchainTokens.forEach((token, idx) => {
    const total = shareClassTotals[idx]
    if (!total) return

    const decimals = shareClassDecimals[idx] ?? 18
    const value = typeof total === 'string' ? BigInt(total) : BigInt(total.toString())
    const scale = BigInt(10) ** BigInt(decimals)
    if (!scale) return
    const usd = Number(value) / Number(scale)
    if (!Number.isFinite(usd) || usd <= 0) return
    offchainUsd += usd
  })

  if (offchainUsd > 0)
    api.addUSDValue(offchainUsd)
}

module.exports.methodology = `TVL includes onchain vault deposits (queried via ERC4626 vaults) and offchain tranche net asset values reported by Centrifuge share classes across supported chains.`
Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})
