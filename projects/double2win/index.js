const { cachedGraphQuery } = require('../helper/cache')
const { sumUnknownTokens } = require('../helper/unknownTokens')
const { sumTokens2 } = require("../helper/unwrapLPs")

async function getTokens(chain, subgraph) {
  const graphQuery = `
    {
      assetTokens(where: {amount_gt: "0"}) {
        tokenAddress
      }
      migrations(where: {pair_starts_with: "0x", lpAmount_gt: "0"}) {
        pair
        ammType
      }
      liquidities(where: {pair_starts_with: "0x", lpAmount_gt: "0"}) {
        pair
        ammType
      }
    }
  `

  const { assetTokens, migrations, liquidities } = await cachedGraphQuery(`double2win/${chain}`, subgraph, graphQuery)
  const tokens = []

  migrations.forEach(migration => { tokens.push(migration.pair.toLowerCase()) })
  liquidities.forEach(liquidity => { tokens.push(liquidity.pair.toLowerCase()) })
  assetTokens.forEach(assetToken => { tokens.push(assetToken.tokenAddress.toLowerCase()) })

  return tokens
}

async function arbitrumTvl(api) {
  const chain = api.chain
  const subgraph = "https://api.studio.thegraph.com/query/16975/double-arbitrum/version/latest"
  const addresses = {
    uniswapV2Vault: '0xBf212dEE0aea6531dEb0B02be6E70b527dDF8246',
    uniswapV2Migration: '0x1c6E7CE03ae7a9A252BcE0C9F871654dBB0C7ca5',
    uniswapV3Vault: '0x07116C5ED5cBb49464f64926Ba152B8985fe3AFf',
    uniswapV3Migration: '0x99F980fa0b1939A0A1033092EF2a668df8D8b70D',
    assetVault: '0x7C09A9c30736F17043Fe6D0C0A3D03a7Cf6e78FD',
  }
  
  const tokens = await getTokens(chain, subgraph)
  let tokenBalances = {}

  await sumTokens2({ api, balances: tokenBalances, owner: addresses.uniswapV3Vault, chain: chain, resolveUniV3: true })
  await sumTokens2({ api, balances: tokenBalances, owner: addresses.uniswapV3Migration, chain: chain, resolveUniV3: true })
  await sumTokens2({ api, balances: tokenBalances, owner: addresses.uniswapV2Vault, tokens, chain: chain, resolveLP: true })
  await sumTokens2({ api, balances: tokenBalances, owner: addresses.uniswapV2Migration, tokens, chain: chain, resolveLP: true })
  await sumTokens2({ api, balances: tokenBalances, owner: addresses.assetVault, tokens, chain: chain })
  
  return tokenBalances
}

module.exports = {
  arbitrum: {
    tvl: arbitrumTvl,
  },
}
