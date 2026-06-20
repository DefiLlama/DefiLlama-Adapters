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
const { registry, manualPool, blueschain, } = {
  "registry": {
    "milkomeda": "0xb42F2f37Dedf435F4916665d6B4c2cC643A17f14",
    "milkomeda_a1": "0xa98C276d262Cc3Bf660189E2eBE74c4B8C18e50a",
    "kava": "0x49399653f651A25924b3D8718276b5b4372577b1",
    "polygon": "0x2080A319A4B11D097050722b6b65d09F754EdC83",
    "bob": "0xFF485b08a64046B9A23342D6098f26e7C237c19A"
  },
  "manualPool": {
    "milkomeda": "0xA4f0e3C80C77b347250B9D3999478E305FF814A4",
    "milkomeda_a1": "0x589E3Edd93A22FB316cff53eABA6BB958ff601cd",
    "kava": "0x7A60918Bd5c83Ef7e2ABA87D13e3FD704f6A77E1",
    "bob": "0x784156F8729c64BAd3CC79fc20d1e8Cde8D42E96"
  },
  "blueschain": {
    "milkomeda": {
      "reserve": "0xa2351AEA209ceB0ffeCd77149eC615335d7f513d",
      "tokens": [
        "0xAE83571000aF4499798d1e3b0fA0070EB3A3E3F9",
        "0x8c008BBA2Dd56b99f4A6aB276bE3a478cB075F0C"
      ]
    },
    "polygon": {
      "reserve": "0x3abd79823C595C0778e51246c491126e77367b20",
      "tokens": [
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
      ]
    }
  }
};

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
