const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  hallmarks: [
    [1736294400,"Private-key Leak Exploit"]
  ],
  arbitrum: {
    tvl: sumTokensExport({ 
      owners: [
        "0xd4D23332E6256B751E2Da0B9C0b3a70CFe9180C0", // s vault
        "0x9e34F79E39AddB64f4874203066fFDdD6Ab63a41", // m vault
        "0x3B22F749f082bC33Af33751cBD53d21215FC71d1", // l vault
      ], 
      tokens: [
        ADDRESSES.arbitrum.WETH,
        ADDRESSES.arbitrum.USDC_CIRCLE,
        ADDRESSES.arbitrum.WBTC,
      ]
    })
  }
}