const { getLogs2 } = require('../helper/cache/getLogs');
const { getTokenSupplies } = require('../helper/solana');
const ADDRESSES = require('../helper/coreAssets.json')

const nullAddress = ADDRESSES.null

const CONFIG = {
  ethereum: {
    factories: [
      { START_BLOCK: 20432393, TOKEN_FACTORY_V2: '0x91808B5E2F6d7483D41A681034D7c9DbB64B9E29' }, // v2
      { START_BLOCK: 22924277, TOKEN_FACTORY_V3: '0xd30Da1d7F964E5f6C2D9fE2AAA97517F6B23FA2B' }, // v3
      { START_BLOCK: 24369775, TOKEN_FACTORY_V3_1: '0xEC3582fcDc34078a4B7a8c75a5a3AE46f48525aB' }, // v3.1
    ],
    assets: { USDC: ADDRESSES.ethereum.USDC }
  },
  base: {
    factories: [
      { START_BLOCK: 17854404, TOKEN_FACTORY_V2: '0x7f192F34499DdB2bE06c4754CFf2a21c4B056994' }, // v2
      { START_BLOCK: 32901390, TOKEN_FACTORY_V3: '0xd30Da1d7F964E5f6C2D9fE2AAA97517F6B23FA2B' }, // v3
      { START_BLOCK: 41626601, TOKEN_FACTORY_V3_1: '0xEC3582fcDc34078a4B7a8c75a5a3AE46f48525aB' }, // v3.1
    ],
    assets: { USDC: ADDRESSES.base.USDC }
  },
  arbitrum: {
    factories: [
      { START_BLOCK: 238245701, TOKEN_FACTORY_V2: '0x91808B5E2F6d7483D41A681034D7c9DbB64B9E29' }, // v2
      { START_BLOCK: 357984300, TOKEN_FACTORY_V3: '0xd30Da1d7F964E5f6C2D9fE2AAA97517F6B23FA2B' }, // v3
      { START_BLOCK: 427871358, TOKEN_FACTORY_V3_1: '0xEC3582fcDc34078a4B7a8c75a5a3AE46f48525aB' }, // v3.1
    ],
    assets: { USDC: ADDRESSES.arbitrum.USDC_CIRCLE }
  },
  avax: {
    factories: [
      { START_BLOCK: 65493376, TOKEN_FACTORY_V3: '0xd30Da1d7F964E5f6C2D9fE2AAA97517F6B23FA2B' }, // v3
      { START_BLOCK: 77109103, TOKEN_FACTORY_V3_1: '0xEC3582fcDc34078a4B7a8c75a5a3AE46f48525aB' }, // v3.1
    ],
    assets: { USDC: ADDRESSES.avax.USDC }
  },
  bsc: {
    factories: [
      { START_BLOCK: 54801665, TOKEN_FACTORY_V3: '0xd30Da1d7F964E5f6C2D9fE2AAA97517F6B23FA2B' }, // v3
      { START_BLOCK: 75504469, TOKEN_FACTORY_V3_1: '0xEC3582fcDc34078a4B7a8c75a5a3AE46f48525aB' }, // v3.1
    ],
    assets: [ADDRESSES.bsc.USDC, ADDRESSES.bsc.USDT]
  },
  plume_mainnet: {
    factories: [
      { START_BLOCK: 15715268, TOKEN_FACTORY_V3: '0xd30Da1d7F964E5f6C2D9fE2AAA97517F6B23FA2B' }, // v3
      { START_BLOCK: 49254120, TOKEN_FACTORY_V3_1: '0xEC3582fcDc34078a4B7a8c75a5a3AE46f48525aB' }, // v3.1
    ],
    assets: { USDC: ADDRESSES.plume_mainnet.USDC }
  },
  optimism: {
    factories: [
      { START_BLOCK: 147221955, TOKEN_FACTORY_V3_1: '0xEC3582fcDc34078a4B7a8c75a5a3AE46f48525aB' }, // v3.1
    ],
    assets: { USDC: ADDRESSES.optimism.USDC_CIRCLE }
  },
  monad: {
    factories: [
      { START_BLOCK: 52763152, TOKEN_FACTORY_V3_1: '0xEC3582fcDc34078a4B7a8c75a5a3AE46f48525aB' }, // v3.1
    ],
    assets: { USDC: ADDRESSES.monad.USDC }
  },
  hyperliquid: {
    factories: [
      { START_BLOCK: 26241275, TOKEN_FACTORY_V3_1: '0xEC3582fcDc34078a4B7a8c75a5a3AE46f48525aB' }, // v3.1
    ],
    assets: [ADDRESSES.hyperliquid.USDC, ADDRESSES.hyperliquid.USDT0, '0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463'] // USDC, USDT0, UBTC
  },
  pharos: {
    factories: [
      { START_BLOCK: 2495896, TOKEN_FACTORY_V3_1: '0xEC3582fcDc34078a4B7a8c75a5a3AE46f48525aB' }, // v3.1
    ],
    assets: { USDC: ADDRESSES.pharos.USDC }
  },
}

const abis = {
  getVault: "function vault(address asset) external view returns (address)",
  totalAssets: "function totalAssets() external view returns (uint256)",
};

const eventAbis = {
  deployTranches: 'event DeployTranche(uint64 indexed poolId, bytes16 indexed trancheId, address indexed tranche)',
  addShareClass: 'event AddShareClass(uint64 indexed poolId, bytes16 indexed scId, address token)'
}

const getTokens = async (api, block, factories) => {
  const logs = await Promise.all(
    factories.map(async (factory) => {
      let allTranches = []

      if (factory.TOKEN_FACTORY_V2) {
        const tranches = await getLogs2({ api, target: factory.TOKEN_FACTORY_V2, fromBlock: factory.START_BLOCK, toBlock: block, eventAbi: eventAbis.deployTranches })
        allTranches.push(...tranches.map(({ tranche }) => tranche))
      }

      if (factory.TOKEN_FACTORY_V3) {
        const shareClasses = await getLogs2({ api, target: factory.TOKEN_FACTORY_V3, fromBlock: factory.START_BLOCK, toBlock: block, eventAbi: eventAbis.addShareClass })
        allTranches.push(...shareClasses.map(({ token }) => token))
      }

      if (factory.TOKEN_FACTORY_V3_1) {
        const shareClasses = await getLogs2({ api, target: factory.TOKEN_FACTORY_V3_1, fromBlock: factory.START_BLOCK, toBlock: block, eventAbi: eventAbis.addShareClass })
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
  const { factories, assets } = CONFIG[chain]
  const tokens = await getTokens(api, block, factories)
  if (!tokens || tokens.length === 0) return;

  const assetList = Array.isArray(assets) ? assets : [assets.USDC]

  // Build all (token, asset) pairs for a single multiCall
  const calls = []
  const callMeta = [] // track which token and asset index each call corresponds to
  for (const token of tokens) {
    for (let i = 0; i < assetList.length; i++) {
      calls.push({ target: token, params: [assetList[i]] })
      callMeta.push({ token, assetIndex: i })
    }
  }

  const vaults = await api.multiCall({
    calls,
    abi: abis.getVault,
    permitFailure: true
  })

  // For each token, find the first valid vault (by asset order) to avoid double counting
  // All vaults for the same token report the same totalAssets (the share class NAV)
  const tokenVaults = new Map()
  vaults.forEach((vault, i) => {
    const { token, assetIndex } = callMeta[i]
    if (!tokenVaults.has(token) && vault && vault.toLowerCase() !== nullAddress) {
      tokenVaults.set(token, vault)
    }
  })

  const uniqueVaults = [...new Set(tokenVaults.values())]
  if (uniqueVaults.length === 0) return

  await api.erc4626Sum({ calls: uniqueVaults, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets', permitFailure: true })
}

// The JAAA share class is also issued as an SPL token on Solana. The mint is
// not independently priced, so its total supply is valued at the EVM JAAA share
// price (same NAV per share; both tokens are 6 decimals). The assets backing
// these Solana-issued shares already sit in the EVM vault and are therefore
// counted in the Ethereum TVL above, so we subtract the same value from
// Ethereum to attribute it to Solana without double counting.
const JAAA_SOLANA_MINT = 'AAAJXeGjpKu7W3X4QTSU4pm1Wbj4G2LPcdg7A6xJLLyG'
const JAAA_EVM = '0x5a0F93D040De44e78F251b03c43be9CF317Dcf64' // ethereum, 6 decimals

const getJaaaSolanaSupply = async () => {
  const supplies = await getTokenSupplies([JAAA_SOLANA_MINT])
  return supplies[JAAA_SOLANA_MINT]
}

// getTokenSupplies reads the mint's live supply from the Solana RPC and is not
// block/timestamp aware, unlike the EVM vault reads. To avoid subtracting today's
// JAAA supply from historical Ethereum balances during backfill, the Solana
// adjustment is applied only to live runs (the current UTC day). Historical points
// keep all JAAA backing on Ethereum, where it was before the Solana mint launched
// and where it remains unmeasurable historically.
const startOfTodayUTC = () => {
  const now = new Date()
  return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 1000)
}
const isHistorical = (api) => api.timestamp && api.timestamp < startOfTodayUTC()

const solanaTvl = async (api) => {
  if (isHistorical(api)) return
  const supply = await getJaaaSolanaSupply()
  if (supply) api.add(`ethereum:${JAAA_EVM}`, supply, { skipChain: true })
}

// Ethereum wraps the shared EVM tvl and removes the Solana-issued JAAA value,
// whose backing is already reflected in the vault assets measured above.
const ethereumTvl = async (api) => {
  await tvl(api)
  if (isHistorical(api)) return
  const supply = await getJaaaSolanaSupply()
  if (supply) api.add(JAAA_EVM, (-BigInt(supply)).toString())
}

module.exports.methodology = `TVL corresponds to the total USD value of tokens minted on Centrifuge. On EVM chains it is measured from the assets backing each share class vault. The JAAA share class is also issued on Solana; its SPL supply is valued at the EVM JAAA share price and shown on Solana, with the equivalent value subtracted from Ethereum to avoid double counting (its backing already sits in the EVM vault).`
Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})

module.exports.ethereum = { tvl: ethereumTvl }
module.exports.solana = { tvl: solanaTvl }
