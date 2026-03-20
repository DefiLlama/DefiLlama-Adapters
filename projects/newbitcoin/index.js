const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { getCoreAssets } = require('../helper/tokenMapping')
const sdk = require('@defillama/sdk')

const { uniV3Export } = require('../helper/uniswapV3')

const uniExports = uniV3Export({
  nos: {
    factory: '0x1d12AC81710da54A50e2e9095E20dB2D915Ce3C8', fromBlock: 320282, sumChunkSize: 50, filterFn: async (api, logs) => {
      const tokens = logs.map(i => [i.token0, i.token1]).flat()
      const coreAssets = new Set(getCoreAssets(api.chain))
      return tokens.filter(i => !coreAssets.has(i.toLowerCase()))
    }
  },
})

module.exports = {
  deadFrom: "2024-04-28",
  nos: {
    tvl: sdk.util.sumChainTvls([sumTokensExport({ owner: '0xea21fbBB923E553d7b98D14106A104665BA57eCd', tokens: [ADDRESSES.nos.BTC] }), uniExports.nos.tvl])
  }
}