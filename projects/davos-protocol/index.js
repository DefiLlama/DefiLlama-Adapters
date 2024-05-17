const { get } = require("../helper/http")

const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, } = require('../helper/unknownTokens')

module.exports = {
  methodology: 'collateral TVL * collateral price', 
  arbitrum: {
    tvl: get('https://api.prod.davos.xyz/cmc/total-tvl?blockchain=42161'),
  },
  bsc: {
    tvl: get('https://api.prod.davos.xyz/cmc/total-tvl?blockchain=56'),
  },
  ethereum: {
    tvl: get('https://api.prod.davos.xyz/cmc/total-tvl?blockchain=1'),
  },
  optimism: {
    tvl: get('https://api.prod.davos.xyz/cmc/total-tvl?blockchain=10'),
  },
  polygon: {
    tvl: get('https://api.prod.davos.xyz/cmc/total-tvl?blockchain=137'),
  },
  polygon_zkevm: {
    tvl: get('https://api.prod.davos.xyz/cmc/total-tvl?blockchain=1101'),
  },
  mode: {
    tvl: get('https://api.prod.davos.xyz/cmc/total-tvl?blockchain=34443'),
  },
  linea: {
    tvl: get('https://api.prod.davos.xyz/cmc/total-tvl?blockchain=59144'),
  },
}
