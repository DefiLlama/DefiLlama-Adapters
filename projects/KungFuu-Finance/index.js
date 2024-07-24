const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const wFTM = ADDRESSES.fantom.WFTM
const kngfuu_token = "0x89b61Ab033584918103698953870F07D6db412A3".toLowerCase()
const owners = ["0x29187b10a04B269Cf067AE013B3ab58d4affaC03", "0xaaef45e31e2d2865a4722c1591ba4cd8f6e83bad", "0xfeAFAF0610fe2c73bB6345080056066aE109B31F"]

const treasuryTokens = [
  ADDRESSES.null, 
  wFTM, // WFTM
  ADDRESSES.fantom.USDC, // USDC
  "0xf704f5ac5edf152168e07e6f5f108366911250ac", // WFTM/KNGFUU, needs to account only half of it
]

module.exports = {
  fantom: {
    tvl: sumTokensExport({ owners, tokens: treasuryTokens, })
  }
}