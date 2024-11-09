const { staking } = require('../helper/staking')
const { uniV3Export, uniV3GraphExport } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  era: { factory: '0x31be61CE896e8770B21e7A1CAFA28402Dd701995', fromBlock: 1351075, },
  fantom: { factory: '0xaf20f5f19698f1D19351028cd7103B63D30DE7d7', fromBlock: 60063058, },
  kava: { factory: '0x0e0Ce4D450c705F8a0B6Dd9d5123e3df2787D16B', fromBlock: 6037137, },
  ethereum: { factory: '0xB9a14EE1cd3417f3AcC988F61650895151abde24', fromBlock: 18240112, },
  metis: { factory: '0x8112E18a34b63964388a3B2984037d6a2EFE5B8A', fromBlock: 9740222, },
  zklink: { factory: '0x6175b648473F1d4c1549aAC3c2d007e7720585e6', fromBlock: 1339353, },
  iotaevm: { factory: '0x01Bd510B2eA106917e711f9a05a42fC162bee2Ac', fromBlock: 143828, },
  base: { factory: '0x576A1301B42942537d38FB147895fE83fB418fD4', fromBlock: 14250787, },
})

module.exports.kava = { tvl: uniV3GraphExport({ name: 'wagmi-kava', graphURL: 'https://kava.graph.wagmi.com/subgraphs/name/v3' }) }

const stakingConfig = {
  metis: { swagmi: '0x5fb3983adc4dcc82a610a91d2e329f6401352558', wagmi: '0xaf20f5f19698f1d19351028cd7103b63d30de7d7', },
  kava: { swagmi: '0x3690d1a9fb569c21372f8091527ab44f1dc9630f', wagmi: '0xaf20f5f19698f1d19351028cd7103b63d30de7d7', },
}

Object.keys(stakingConfig).forEach(chain => {
  const { swagmi, wagmi, } = stakingConfig[chain]
  module.exports[chain].staking = staking(swagmi, wagmi)
})