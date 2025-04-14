const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const ABIS = {
  Events: {
    CreateMarket:
      'event CreateMarket(address indexed market, address indexed collateral, address indexed debtToken)',
    CreateVault:
      'event CreateVault(address indexed vault, address indexed creator, tuple(address,address,uint256,address,uint256,string,string,uint64) initialParams)',
  },
  Methods: {
    Market: {
      tokens:
        'function tokens() external view override returns (address fixedToken, address xToken, address gearingToken, address collateral, address debt)',
    },
    Vault: {
      asset: 'address:asset',
    },
  },
}

const ADDRESSES = {
  arbitrum: {
    factory: {
      address: '0x14920eb11b71873d01c93b589b40585dacfca096',
      startBlock: 322193553,
    },
    vaultFactory: {
      address: '0x929cbcb8150ad59db63c92a7daec07b30d38ba79',
      startBlock: 322193571,
    },
  },
  ethereum: {
    factory: {
      address: '0x37ba9934aaba7a49cc29d0952c6a91d7c7043dbc',
      startBlock: 22174761,
    },
    vaultFactory: {
      address: '0x01d8c1e0584751085a876892151bf8490e862e3e',
      startBlock: 22174789,
    },
  },
}

const TOPICS = {
  CreateMarket:
    '0x3f53d2c2743b2b162c0aa5d678be4058d3ae2043700424be52c04105df3e2411',
  CreateVault:
    '0x8d49b14f2b628cc0c1a7ad5e098155260cd1881003c9d3107c728be96f706b33',
}

async function fetchCreatedMarkets(api) {
  const createdMarketAddresses = new Set()
  const logs = await getLogs2({
    api,
    eventAbi: ABIS.Events.CreateMarket,
    fromBlock: ADDRESSES[api.chain].factory.startBlock,
    target: ADDRESSES[api.chain].factory.address,
    topic: [TOPICS.CreateMarket],
  })
  for (const log of logs) {
    createdMarketAddresses.add(log.market)
  }
  return Array.from(createdMarketAddresses)
}

async function fetchCreatedVaults(api) {
  const createdVaultAddresses = new Set()
  const logs = await getLogs2({
    api,
    eventAbi: ABIS.Events.CreateVault,
    fromBlock: ADDRESSES[api.chain].vaultFactory.startBlock,
    target: ADDRESSES[api.chain].vaultFactory.address,
    topic: [TOPICS.CreateVault],
  })
  for (const log of logs) {
    createdVaultAddresses.add(log.vault)
  }
  return Array.from(createdVaultAddresses)
}

async function fetchMarketOwnerTokens(api, marketAddresses) {
  const responses = await api.multiCall({
    abi: ABIS.Methods.Market.tokens,
    calls: marketAddresses,
  })
  const ownerTokens = []
  for (let i = 0; i < marketAddresses.length; i++) {
    const marketAddress = marketAddresses[i]
    const { collateral, debt, gearingToken } = responses[i]
    ownerTokens.push([[collateral], gearingToken])
    ownerTokens.push([[debt], marketAddress])
  }
  return ownerTokens
}

async function fetchVaultOwnerTokens(api, vaultAddresses) {
  const responses = await api.multiCall({
    abi: ABIS.Methods.Vault.asset,
    calls: vaultAddresses,
  })
  return responses.map((asset, index) => [[asset], vaultAddresses[index]])
}

async function getTVLOnChain(api) {
  const [marketAddresses, vaultAddresses] = await Promise.all([
    fetchCreatedMarkets(api),
    fetchCreatedVaults(api),
  ])
  const [marketOwnerTokens, vaultOwnerTokens] = await Promise.all([
    fetchMarketOwnerTokens(api, marketAddresses),
    fetchVaultOwnerTokens(api, vaultAddresses),
  ])
  const ownerTokens = [].concat(marketOwnerTokens).concat(vaultOwnerTokens)
  return sumTokens2({
    api,
    ownerTokens,
  })
}

module.exports = {
  arbitrum: {
    tvl: (api) => getTVLOnChain(api),
  },
  ethereum: {
    tvl: (api) => getTVLOnChain(api),
  },
}
