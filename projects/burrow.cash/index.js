const { call, getTokenBalance, } = require('../helper/near')
const BigNumber = require('bignumber.js')
const sdk = require('@defillama/sdk')
const { transformNearAddress } = require('../helper/portedTokens')

const transformAddress = transformNearAddress()

const BURROW_BETA_CONTRACT = 'contract.beta.burrow.near'
const PROBLEMATIC_TOKENS = [
  'aurora',    // I am not sure what aurora token is, but unfortunately it is valued too high (decimal issue?), maybe it is aurora-near but see it being displayed as eth in the UI
]

async function tvl() {
  const balances = {}

  const assetsCallResponse = await call(BURROW_BETA_CONTRACT, 'get_assets_paged', {})
  const assets = assetsCallResponse
    .map(([asset]) => asset)
    .filter(asset => !/\.burrow\./.test(asset))  // Ignore all assets that can be considered native tokens
    .filter(asset => !PROBLEMATIC_TOKENS.includes(asset))
  await Promise.all(assets.map(asset => addAsset(balances, asset)))
  return balances
}

const tokenMapping = {
  'wrap.near': { name: 'near', reduceDecimals: 24, },
  'meta-pool.near': { name: 'staked-near', reduceDecimals: 24, },
}

async function addAsset(balances, token) {
  let balance = await getTokenBalance(token, BURROW_BETA_CONTRACT)
  const { name, reduceDecimals, } = tokenMapping[token] || {}

  if (name) {
    if (reduceDecimals)
      balance = balance.slice(0, balance.length - reduceDecimals)
    token = name
  }

  sdk.util.sumSingleBalance(balances, transformAddress(token), balance)
}

module.exports = {
  near: {
    tvl,
  },
  misrepresentedTokens: true,
  methodology: 'Summed up all the tokens deposited in their beta lending contract'
};