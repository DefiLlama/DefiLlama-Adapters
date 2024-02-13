const { uniV3Export, uniV3GraphExport } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  era: { factory: '0x31be61CE896e8770B21e7A1CAFA28402Dd701995', fromBlock: 1351075, },
  fantom: { factory: '0xaf20f5f19698f1D19351028cd7103B63D30DE7d7', fromBlock: 60063058, },
  kava: { factory: '0x0e0Ce4D450c705F8a0B6Dd9d5123e3df2787D16B', fromBlock: 6037137, },
  ethereum: { factory: '0xB9a14EE1cd3417f3AcC988F61650895151abde24', fromBlock: 18240112, },
  metis: { factory: '0x8112E18a34b63964388a3B2984037d6a2EFE5B8A', fromBlock: 9740222, },
})

module.exports.kava = { tvl: uniV3GraphExport({ name: 'wagmi-kava', graphURL: 'https://kava.graph.wagmi.com/subgraphs/name/v3', minTVLUSD: 0 }) }