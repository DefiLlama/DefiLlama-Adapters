const abi = require("./abi.json");
const { getConfig } = require('../helper/cache')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/chain/brc20')

const BRIDGE_TOKENS = "https://api.multibit.exchange/support/token";

const config = {
  // https://app.multibit.exchange/staking
  ethereum: { stakingPool: "0x2EDfFbc62C3dfFD2a8FbAE3cd83A986B5bbB5495", tokens: [ADDRESSES.null, ADDRESSES.ethereum.USDT] },
  bsc: {},
  polygon: {},
}
module.exports = {
  methodology: `Tokens bridged via MultiBit are counted as TVL`,
  bitcoin: {
    tvl: sumTokensExport({
      owners: [
        'bc1p6r6hx759e3ulvggvd9x3df0rqh27jz59nvfjd2fzmh3wqyt6walq82u38z', // hot wallet
        'bc1pyyms2ssr0hagy5j50r5n689e6ye0626v3c98j5fw0jk6tz3vrgts7nt56g',  // cold wallet
        'bc1qmcrpqanjnrw58y0fvq08fqchgxv5aylctew7vxlkalfns3rpedxsx4hxpu',  // cold wallet
      ],
      blacklistedTokens: ['MUBI', 'BSSB']
    }),

  },
}
Object.keys(config).forEach(chain => {
  const { stakingPool, tokens = [ADDRESSES.null] } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const data = await getConfig('multibit', BRIDGE_TOKENS)
      const key = chain === 'ethereum' ? 'eth': chain
      const owner = data.find(v => v.chain === key)?.real?.contract
      if (!owner) return {}
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
