const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");

const vestingAddress = "0xd7a029db2585553978190db5e85ec724aa4df23f"

const treasury = "0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7"
const treasury2 = "0x690f0581ececcf8389c223170778cd9d029606f2"

const publicGoods = "0xcD42b4c4D102cc22864e3A1341Bb0529c17fD87d"

const metaGov = "0x91c32893216dE3eA0a55ABb9851f581d4503d39b"
const metaGov2 = "0xB162Bf7A7fD64eF32b787719335d06B2780e31D1"

const eco = "0x536013c57DAF01D78e8a70cAd1B1abAda9411819"
const eco2 = "0x9B9c249Be04dd433c7e8FbBF5E61E6741b89966D"

const registrar = "0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5"
const registrar2 = "0x253553366Da8546fC250F225fe3d25d0C782303b"

const endowment = '0x4F2083f5fBede34C2714aFfb3105539775f7FE64'

const ENS = "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72"

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      ADDRESSES.null,
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.sUSDS,
      ADDRESSES.ethereum.LINK
    ],
    resolveUniV3: true,
    resolveStakewiseDeposits: true,
    ownTokens: [ENS],
    owners: [treasury, vestingAddress, treasury2, publicGoods, metaGov, metaGov2, eco, eco2, registrar, registrar2, endowment,],
  },
})