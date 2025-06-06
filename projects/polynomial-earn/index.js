const { getConfig } = require('../helper/cache')

// Polynomial contract addresses
const polynomial_contracts = [
  '0xfa923aa6b4df5bea456df37fa044b37f0fddcdb4',
  '0x331cf6e3e59b18a8bc776a0f652af9e2b42781c5',
  '0xea48dD74BA1Ff41B705ba5Cf993B2D558e12D860',
  '0x23CB080dd0ECCdacbEB0BEb2a769215280B5087D'
]

async function tvlV1(api) {

  const [tokens, _tokens] = await Promise.all([
    api.multiCall({ abi: "address:COLLATERAL", calls: polynomial_contracts, permitFailure: true, }),
    api.multiCall({ abi: "address:UNDERLYING", calls: polynomial_contracts, permitFailure: true, }),
  ])
  tokens.forEach((token, i) => {
    if (!token) tokens[i] = _tokens[i]
  })
  return api.sumTokens({ tokensAndOwners2: [tokens, polynomial_contracts], })
}

async function tvl(api) {
  await tvlV1(api)
  const v1Set = new Set(polynomial_contracts.map(i => i.toLowerCase()))
  const ENDPOINT = 'https://earn-api.polynomial.fi/vaults'
  const response = await getConfig('polynomial-vaults', ENDPOINT)
  // Only allow contracts which sets underlying and COLLATERAL
  const contracts = response.map(contract => contract.vaultAddress).filter(i => !v1Set.has(i.toLowerCase()))

  const [tokens, _tokens,] = await Promise.all([
    api.multiCall({ abi: 'address:UNDERLYING', calls: contracts, permitFailure: true, }),
    api.multiCall({ abi: 'address:SUSD', calls: contracts, permitFailure: true, }),
  ])
  tokens.forEach((token, i) => {
    if (!token) tokens[i] = _tokens[i]
  })
  return api.sumTokens({ tokensAndOwners2: [tokens, contracts], })

}

module.exports = {
  optimism: {
    tvl,
  },
  hallmarks: [
    [1648728000, "Earn V1 Launch"],
    [1655380800, "Earn V1 Shutdown"],
    [1660132800, "Earn V2 Launch"],
  ],
  methodology: 'Using contract methods, TVL is pendingDeposits + totalFunds + premiumCollected and the asset is UNDERLYING or COLLATERAL (put vs call) ',
}