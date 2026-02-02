const { getLogs2 } = require('../helper/cache/getLogs');
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
      { START_BLOCK: 78882747, TOKEN_FACTORY_V3_1: '0xEC3582fcDc34078a4B7a8c75a5a3AE46f48525aB' }, // v3.1
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
      { START_BLOCK: 0, TOKEN_FACTORY_V3_1: '0xEC3582fcDc34078a4B7a8c75a5a3AE46f48525aB' }, // v3.1
    ],
    assets: ['0xb88339CB7199b77E23DB6E890353E22632Ba630f', ADDRESSES.hyperliquid.USDT0, '0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463'] // USDC, USDT0, UBTC
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

  // For each token (share class), find the first valid vault to avoid double counting
  // All vaults for the same token report the same totalAssets (the share class NAV)
  const tokenVaults = new Map()

  for (const asset of assetList) {
    const tokensNeedingVault = tokens.filter(t => !tokenVaults.has(t))
    if (tokensNeedingVault.length === 0) break

    const vaults = await api.multiCall({
      calls: tokensNeedingVault.map((t) => ({ target: t, params: [asset] })),
      abi: abis.getVault,
      permitFailure: true
    })

    tokensNeedingVault.forEach((token, i) => {
      const vault = vaults[i]
      if (vault && vault.toLowerCase() !== nullAddress) {
        tokenVaults.set(token, vault)
      }
    })
  }

  const uniqueVaults = [...new Set(tokenVaults.values())]
  if (uniqueVaults.length === 0) return

  await api.erc4626Sum({ calls: uniqueVaults, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets', permitFailure: true })
}

module.exports.methodology = `TVL corresponds to the total USD value of tokens minted on Centrifuge across Ethereum, Base, and Arbitrum.`
Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})
