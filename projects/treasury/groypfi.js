// GroypFi treasury on TON: the four house wallets (all protocol fees settle here; UQDu4AiT… also runs the
// $GROYP buybacks), the GroypFi $GROYP reserve wallet and the GroypFi multisig (multisig v2, https://multisig.ton.org/#EQCDgsSX3XV1PHIK59-pCcn8GpsqYT7rixgd4EhWGiaKK6Vt).
// Protocol-owned DeDust liquidity is already reported as GroypFi TVL (projects/groypfi-io) and is not repeated here.
const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require('../helper/treasury')

const GROYP = 'EQAtwo6qMNwtr0iTA9eKVZ32cuACFJ0VKd78GrBWOe83-X1P'

module.exports = treasuryExports({
  ton: {
    owners: [
      'UQDu4AiT__JKuqT0Znje0RoXIQMPcj4uIGYZme3UK4hFlE_Q', // house wallet + $GROYP buybacks (groypfihouse.ton)
      'UQCvlNDUcVJq55xVNV9BvCC1KUaMVUetnUkr_sSovHTLmTsj', // house wallet
      'UQAuMfZUcQoiOt-S4vWJhlT2Qlewgrmi99AQ4ISEjDCAIR-i', // house wallet
      'UQDz_6Hyrq2AgMIWw4S5xPH9OBMcaerRp14y94T-cRJistBx', // house wallet
      'EQCDgsSX3XV1PHIK59-pCcn8GpsqYT7rixgd4EhWGiaKK6Vt', // GroypFi multisig
      'UQCnkAaVs7fNpub-w3NfFVYmQtVUldPc7RZj2_CMiKoXfikn', // GroypFi $GROYP reserve wallet
    ],
    tokens: [ADDRESSES.null, ADDRESSES.ton.USDT],
    onlyWhitelistedTokens: true,
    ownTokens: [GROYP],
  },
})
