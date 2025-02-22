const { sumTokensExport } = require("../helper/unwrapLPs");

const neuy = {
  "ethereum": "0xa80505c408C4DEFD9522981cD77e026f5a49FE63",
  "polygon": "0x62a872d9977Db171d9e213A5dc2b782e72ca0033",
}

const ethLP = {
  "ethereum100": "0x83833e3c5363b51db01e74ccc97e98a09ce86dcc",
  "ethereum10": "0x82bcd0c19acb970a75771b370f2a3adea1702a44",
}

const polyLP = {
  "polygon100": "0x8574f0F28Bbd7BCfFec50B00cc4D153C564bfC05",
  "polygon10": "0x83139cf662df4fee8797Dc916EF2B5aaFE86eB16",
}

module.exports = {
 ethereum: {
    tvl: () => ({}),
    staking: sumTokensExport({ owners: Object.values(ethLP), tokens: [neuy.ethereum], } ),
  },
 polygon: {
    tvl: () => ({}),
    staking: sumTokensExport({ owners: Object.values(polyLP), tokens: [neuy.polygon], } ),
  }
} 