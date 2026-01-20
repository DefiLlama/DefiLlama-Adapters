const abi = require("./abi.json");
const sdk = require('@defillama/sdk');
const { getConfig } = require('../helper/cache')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport: sumBRC20TokensExport } = require('../helper/chain/brc20')
const { sumTokensExport } = require('../helper/sumTokens');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const BRIDGE_TOKENS = "https://api.multibit.exchange/support/token";

const config = {
  // https://app.multibit.exchange/staking
  ethereum: { stakingPool: "0x2EDfFbc62C3dfFD2a8FbAE3cd83A986B5bbB5495", tokens: [ADDRESSES.null, ADDRESSES.ethereum.USDT], chainKey: 'eth' },
  bsc: {},
  polygon: {},
  bouncebit: { chainKey: 'bb' },
}
module.exports = {
  methodology: `Tokens bridged via MultiBit are counted as TVL`,
  bitcoin: {
    tvl: sdk.util.sumChainTvls([sumTokensExport({
      owners: bitcoinAddressBook.multibit,
      blacklistedTokens: ['MUBI', 'BSSB', 'savm'] // more SAVM is bridged than circulating supply according to coingecko & etherscan
    }), sumBRC20TokensExport({ owners: bitcoinAddressBook.multibit, blacklistedTokens: ['MUBI', 'BSSB', 'savm'] })]),
  },
}
Object.keys(config).forEach(chain => {
  const { stakingPool,  chainKey = chain } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const data = await getConfig('multibit', BRIDGE_TOKENS)
      const owner = data.find(v => v.chain === chainKey)?.real?.contract
      if (!owner) return {}
      
      const tokens = Object.values(data.find(v => v.chain === chainKey)?.real?.data || [ADDRESSES.null])
      return api.sumTokens({ owner, tokens, })
    }
  }

  if (stakingPool) {
    module.exports[chain].staking = async (api) => {
      const data = await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.pools, target: stakingPool })
      const tokens = data.map(v => v.stakeToken)
      return api.sumTokens({ owner: stakingPool, tokens, })
    }
  }
})
