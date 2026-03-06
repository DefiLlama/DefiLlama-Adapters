const { sumTokens2 } = require('../helper/unwrapLPs')

const abi = {
    "BlueshiftRegistry": {
      "getPortfolios": "function getPortfolios() view returns (tuple(string[] name, address[] contractAddress, address[] baseTokenAddress, address[] lpTokenAddress, uint256[] lpTokenPrice, uint256[] totalValue, uint256[] tokenCount, uint256[] baseTokenPriceCoefficient, tuple(address[] tokenAddress, uint256[] amount, uint256[] price, uint256[] depositLimit, uint256[] withdrawLimit, uint256[] depositEMAPrice, uint256[] withdrawEMAPrice, uint256[] portfolioShare, uint256[] targetWeight)[] tokens))"
    },
    "BlueshiftEarning": {
      "getAccDeposit": "uint256:getAccDeposit",
      "getToken": "address:getToken"
    }
  };
const { registry, manualPool, blueschain, } = require("./config.json");

async function staking(api) {
  const chain = api.chain
  if (chain === 'milkomeda_a1') return {}
  if (!manualPool[chain]) return {}
  const value = await api.call({ abi: abi.BlueshiftEarning.getAccDeposit, target: manualPool[chain], })
  const tokenAddress = await api.call({ abi: abi.BlueshiftEarning.getToken, target: manualPool[chain], })
  api.add(tokenAddress, value)
  return api.getBalances()
}

async function tvl(api) {
  const chain = api.chain
  if (chain === 'milkomeda_a1') return {}
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
