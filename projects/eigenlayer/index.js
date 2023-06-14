const { sumTokensExport } = require("../helper/unwrapLPs")

// eigen pods are paused for now but theyre missing
module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        '0x93c4b944d05dfe6df7645a86cd2206016c51564d', //steth
        '0x1bee69b7dfffa4e2d53c2a2df135c388ad25dcd2', //reth
        '0x54945180db7943c0ed0fee7edab2bd24620256bc', //cbeth
      ],
      tokens: [
        '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
        '0xae78736cd615f374d3085123a210448e74fc6393',
        '0xbe9895146f7af43049ca1c1ae358b0541ea49704',
      ]
    }),
  },
}