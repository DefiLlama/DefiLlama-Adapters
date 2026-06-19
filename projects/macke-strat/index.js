const { sumTokens2 } = require('../helper/unwrapLPs')

// Public mSTRAT portfolios on Ethereum (Velvet Capital non-custodial vaults)
// Source: https://github.com/macke.meme frontend config (KNOWN_VAULTS)
// Excludes BLOCKED_PORTFOLIOS (failed/withheld deploys and hidden MSTRAT4)
const STRAT_PORTFOLIOS = [
  '0xec0aca1a5793bd9e46d36158c5f08942e44a6da9', // MSTRAT
  '0x5f9e99874574c0c55387359aa8a1a86e61fed180', // MSTRAT1
  '0xb94503152bbeab4dd64fa03b4a101c681b020676', // MSTRAT2
]

async function tvl(api) {
  const [tokens, vaults] = await Promise.all([
    api.multiCall({ abi: 'address[]:getTokens', calls: STRAT_PORTFOLIOS }),
    api.multiCall({ abi: 'address:vault', calls: STRAT_PORTFOLIOS }),
  ])

  const ownerTokens = tokens.map((tokens, i) => [tokens, vaults[i]])
  return sumTokens2({ api, ownerTokens, resolveLP: true })
}

module.exports = {
  methodology:
    'Counts MACKE and other whitelisted assets held in Velvet vault Safe addresses backing public mSTRAT portfolios (MSTRAT, MSTRAT1, MSTRAT2). Withheld or failed deploys are excluded.',
  start: 1781084831, // MSTRAT portfolio deployment (block 25286245)
  timetravel: true,
  ethereum: { tvl },
}
