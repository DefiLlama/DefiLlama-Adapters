const { sumTokens2 } = require('../helper/unwrapLPs')

const abi = require('./abi.json');
const { registry, manualPool, blueschain, } = require("./config.json");

async function staking(_, _1, _2, { api }) {
  const chain = api.chain
  if (!manualPool[chain]) return {}
  const value = await api.call({ abi: abi.BlueshiftEarning.getAccDeposit, target: manualPool[chain], })
  const tokenAddress = await api.call({ abi: abi.BlueshiftEarning.getToken, target: manualPool[chain], })
  api.add(tokenAddress, value)
  return api.getBalances()
}

async function tvl(_, _1, _2, { api }) {
  const chain = api.chain
  const { reserve, tokens } = blueschain[chain] ?? {}

  // Blueschain reserves
  if (reserve)
    await sumTokens2({ api, owner: reserve, tokens, })

  // Local reserves
  if (registry[chain]) {
    const portfolios = await api.call({ abi: abi.BlueshiftRegistry.getPortfolios, target: registry[chain], })

    for (let i = 0; i < portfolios.contractAddress.length; ++i)
      api.add(portfolios.baseTokenAddress[i], portfolios.totalValue[i])
  }
  return api.getBalances()
}


module.exports = {
  methodology: 'Accumulates TVL of all Blueshift portfolios calculated in base tokens. Adds TVL of BLUES tokens staked in Blueshift yield pools.',
};

Object.keys(registry).forEach(chain => {
  module.exports[chain] = { tvl, staking }
})
