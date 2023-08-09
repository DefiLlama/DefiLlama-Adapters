const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require('../helper/unwrapLPs')
const { getChainTransform } = require('../helper/portedTokens')
const sdk = require("@defillama/sdk")

const wFTM = ADDRESSES.fantom.WFTM
const kngfuu_token = "0x89b61Ab033584918103698953870F07D6db412A3".toLowerCase()

async function tvl(ts, _block, { fantom: block }) {
  const chain = 'fantom'
  const balances = {}
  const transform = await getChainTransform(chain)
  const owners = ["0x29187b10a04B269Cf067AE013B3ab58d4affaC03", "0xaaef45e31e2d2865a4722c1591ba4cd8f6e83bad", "0xfeAFAF0610fe2c73bB6345080056066aE109B31F"]
  const treasuryTokens = [
    wFTM, // WFTM
    ADDRESSES.fantom.USDC, // USDC
    "0xf704f5ac5edf152168e07e6f5f108366911250ac", // WFTM/KNGFUU, needs to account only half of it
  ]

  const tokensAndOwners = []
  treasuryTokens.forEach(t => owners.forEach(o => tokensAndOwners.push([t, o])))
  await sumTokens(balances, tokensAndOwners, block, chain, transform)
  delete balances[transform(kngfuu_token)]
  const  { output: results } = await sdk.api.eth.getBalances({ targets: owners, chain, block})
  for (const res of results) sdk.util.sumSingleBalance(balances, transform(wFTM), res.balance)
  return balances
}

module.exports = {
  fantom: {
    tvl
  }
}