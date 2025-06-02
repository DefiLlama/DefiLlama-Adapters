const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  hallmarks: [
    [1736294400,"Private-key Leak Exploit"],
    [1737072000,"Moby Restored"]
  ],
  arbitrum: {
    tvl: sumTokensExport({ 
      owners: [
        "0xd4D23332E6256B751E2Da0B9C0b3a70CFe9180C0", // (old) s vault
        "0x9e34F79E39AddB64f4874203066fFDdD6Ab63a41", // (old) m vault
        "0x3B22F749f082bC33Af33751cBD53d21215FC71d1", // (old) l vault
        "0x157CF8715b8362441669f8c89229bd6d4aa3EE92", // s vault
        "0x0DB7707a3188D28300f97E3c4a513630106eD192", // m vault
        "0x8aBd3F9a4047FB959F3089744DBaAec393aD2e09", // l vault
      ], 
      tokens: [
        ADDRESSES.arbitrum.WETH,
        ADDRESSES.arbitrum.USDC_CIRCLE,
        ADDRESSES.arbitrum.WBTC,
      ]
    })
  },
  berachain: {
    tvl: sumTokensExport({ 
      owners: [
        "0x66f782E776a91CE9c33EcD07f7D2a9743775209e", // vault
      ],
      tokens: [
        ADDRESSES.berachain.WETH,
        ADDRESSES.berachain.USDC,
        ADDRESSES.berachain.WBTC,
        ADDRESSES.berachain.HONEY
      ]
    }),
  }
}