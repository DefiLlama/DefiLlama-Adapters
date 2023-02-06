const { get } = require('../helper/http')
const sdk = require('@defillama/sdk')
const { transformBalances } = require('../helper/portedTokens')
const { getLogs, getAddress } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
let data

async function getData() {
  if (!data) data = get('https://testnet-client-bff-ocstrhuppq-uc.a.run.app/convexity/assets/all')
  return data
}

async function tvl() {
  const balances = {}
  const data = await getData()
  data.forEach(i => sdk.util.sumSingleBalance(balances, i.base_denom, i.available_liquidity_tokens * (10 ** i.exponent)))
  return transformBalances('umee', balances)
}

async function borrowed() {
  const balances = {}
  const data = await getData()
  data.forEach(i => sdk.util.sumSingleBalance(balances, i.base_denom, i.total_borrow * (10 ** i.exponent)))
  return transformBalances('umee', balances)
}

async function ethTvl(_, _b, _cb, { api, }) {
  const logs = await getLogs({
    api,
    target: '0xe296db0a0e9a225202717e9812bf29ca4f333ba6',
    topics: ['0x3a0ca721fc364424566385a1aa271ed508cc2c0949c2272575fb3013a163a45f'],
    fromBlock: 14216544,
    eventAbi: 'event ReserveInitialized (address indexed asset, address indexed aToken, address stableDebtToken, address variableDebtToken, address interestRateStrategyAddress)',
    onlyArgs: true,
  })
  const tokensAndOwners = logs.map(i => ([i.asset, i.aToken]))
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  timetravel: false,
  methodology: "Total supplied assets - total borrowed assets",
  umee: {
    tvl,
    borrowed,
  },
  ethereum: {
    tvl: ethTvl
  },
};
