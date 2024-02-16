const axios = require('axios')
const sdk = require('@defillama/sdk')
const BigNumber = require("bignumber.js")
const { sumTokens } = require('../helper/unwrapLPs')

const chains = {
  ethereum: 'https://api.idle.finance/pools',
  polygon: 'https://api-polygon.idle.finance/pools',
  optimism: 'https://api-optimism.idle.finance/pools',
  polygon_zkevm: 'https://api-zkevm.idle.finance/pools',
}

const AUTH_TOKEN_ENCODED = 'ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR2xsYm5SSlpDSTZJa0Z3Y0RZaUxDSnBZWFFpT2pFMk56QXlNemMxTWpkOS5rbnNtekVOSm40Yk5Ea0ZCM3h2eWZyaDBwVlFLTHY0NW9JanJQNHdRTU5N'

async function getDataWithAuth(url, token) {
  const data = await axios.get(url, {headers: {Authorization: `Bearer ${token}`}})
  return data?.data
}

const tvl = async (time, ethBlock, chainBlocks, { api }) => {
  const AUTH_TOKEN_DECODED = atob(AUTH_TOKEN_ENCODED)
  const data = await getDataWithAuth(chains[api.chain], AUTH_TOKEN_DECODED)
  
  // Load tokens decimals
  const callsDecimals = data.map( t => ({ target: t.underlyingAddress, params: [] }) )
  const decimalsResults = await api.multiCall({abi: 'erc20:decimals', calls: callsDecimals})
  const tokensDecimals = decimalsResults.reduce( (tokensDecimals, decimals, i) => {
    const call = callsDecimals[i]
    tokensDecimals[call.target] = decimals
    return tokensDecimals
  }, {})

  const balances = {}

  data.forEach((v) => {
    sdk.util.sumSingleBalance(balances, v.underlyingAddress, BigNumber(v.underlyingTVL).times(`1e${tokensDecimals[v.underlyingAddress]}`).toFixed(0), api.chain)
  })
  return sumTokens(balances, [], chainBlocks[api.chain], api.chain, true)
}

Object.keys(chains).forEach(chain => {
  module.exports[chain] = { tvl }
})