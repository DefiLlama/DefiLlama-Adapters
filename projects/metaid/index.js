const { nullAddress, sumTokensExport } = require('../helper/unwrapLPs')
const USDC = "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f"
const wkava = "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b"
const MetaId = "0x8dD02F065EE650787A414568a13948629fa21333"


module.exports = {
    kava: {
      tvl: sumTokensExport({ tokensAndOwners: [
        [USDC, MetaId],
        [wkava, MetaId],
        [nullAddress, MetaId],
      ]}),
    },
  }