const sdk = require('@defillama/sdk')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getUniqueAddresses } = require('../helper/tokenMapping')

const E_WHITELIST = '0xB43baD2638696F8bC82247B92bD56B8DF37d89aB'
const REGISTRY = '0x06767e8090bA5c4Eca89ED00C3A719909D503ED6' // same on all chains

module.exports = {
  methodology: `Rigoblock TVL on Ethereum, Arbitrum, Optimism and Polygon pulled from onchain data`,
}
const config = {
  ethereum: { fromBlock: 15817831, GRG_VAULT_ADDRESSES: '0xfbd2588b170Ff776eBb1aBbB58C0fbE3ffFe1931', GRG_TOKEN_ADDRESSES: '0x4FbB350052Bca5417566f188eB2EBCE5b19BC964', },
  arbitrum: { fromBlock: 32290603, GRG_VAULT_ADDRESSES: '0xE86a667F239A2531C9d398E81154ba125030497e', GRG_TOKEN_ADDRESSES: '0x7F4638A58C0615037deCc86f1daE60E55fE92874', },
  optimism: { fromBlock: 31239008, GRG_VAULT_ADDRESSES: '0x5932C223186F7856e08A1D7b35ACc2Aa5fC57BfD', GRG_TOKEN_ADDRESSES: '0xEcF46257ed31c329F204Eb43E254C609dee143B3', },
  polygon: { fromBlock: 34751673, GRG_VAULT_ADDRESSES: '0xF241De983959A483F376fDC8Ed09DC580BA66109', GRG_TOKEN_ADDRESSES: '0xBC0BEA8E634ec838a2a45F8A43E7E16Cd2a8BA99', },
}

Object.keys(config).forEach(chain => {
  const { fromBlock, GRG_TOKEN_ADDRESSES, GRG_VAULT_ADDRESSES } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const { pools, tokens } = await getPoolInfo(api)
      return sumTokens2({ owners: pools, tokens, api, resolveUniV3: true, blacklistedTokens: [GRG_TOKEN_ADDRESSES] })
    },
    staking: async (api) => {
      const { pools, tokens } = await getPoolInfo(api)
      const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: pools, target: GRG_VAULT_ADDRESSES })
      bals.forEach(i => api.add(GRG_TOKEN_ADDRESSES, i))
      return sumTokens2({ owners: pools, tokens: [GRG_TOKEN_ADDRESSES], api, resolveUniV3: true, uniV3WhitelistedTokens: [GRG_TOKEN_ADDRESSES] })
    },
  }

  async function getPoolInfo(api) {
    const poolKey = `${api.chain}-${api.block}`
    if (!poolData[poolKey]) poolData[poolKey] = _getPoolInfo()
    return poolData[poolKey]

    async function _getPoolInfo() {
      const registeredLogs = await getLogs({
        api,
        target: REGISTRY,
        fromBlock,
        topic: 'Registered(address,address,bytes32,bytes32,bytes32)',
        onlyArgs: true,
        eventAbi: 'event Registered(address indexed group, address pool, bytes32 indexed name, bytes32 indexed symbol, bytes32 id)'
      })
      const whitelistedTokensLogs = await getLogs({
        api,
        target: E_WHITELIST,
        fromBlock,
        topic: 'Whitelisted(address,bool)',
        onlyArgs: true,
        eventAbi: 'event Whitelisted(address indexed token, bool isWhitelisted)'
      })
      const pools = registeredLogs.map(i => i.pool)
      let tokens = whitelistedTokensLogs.map(i => i.token)
      tokens.push(nullAddress)
      // we may have duplicates if a token is first whitelisted than removed
      tokens = getUniqueAddresses(tokens)
      sdk.log('chain: ', api.chain, 'pools: ', pools.length, 'tokens: ', tokens.length)
      return { pools, tokens }
    }
  }
})

const poolData = {}