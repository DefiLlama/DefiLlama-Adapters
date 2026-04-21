const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { treasuryExports } = require('../helper/treasury')

const MONSTRO = '0x1d3bE1CC80cA89DDbabe5b5C254AF63200e708f7'
const ALB = '0x1dd2d631c92b1aCdFCDd51A0F7145A50130050C4'
const ES_ALB = '0x365c6d588e8611125De3bEA5B9280C304FA54113'

const DAO_WALLETS = [
  '0x4713b3ab36C9759043694757E6Cb8123915a8dd0', // Treasury
  '0xA6Cd9800EfF0994B3f64c330de4E55925d5404DC', // DAO Stake
  '0xCb7c195De077B9CADBC5c086Ba7932149B9f4391', // POL
  '0xce45B2ae92c9dc7E39EbB9d9dB6920897A6F6b4a', // Emissions
]

module.exports = treasuryExports({
  base: {
    owners: DAO_WALLETS,
    ownTokens: [MONSTRO],
    tokens: [
      ADDRESSES.base.USDC,
      ADDRESSES.base.WETH,
      ALB,
    ],
  },
})
