const TROVE_MANAGER_LIST = [
  '0x0598Ef47508Ec11a503670Ac3B642AAE8EAEdEFA', // WBTC Collateral
  '0xa794a7Fd668FE378E095849caafA8C8dC7E84780', // wstBTC Collateral
]

async function tvl(api) {
  const tokens = await api.multiCall({  abi: 'address:collateralToken', calls: TROVE_MANAGER_LIST})
  return api.sumTokens({ tokensAndOwners2: [tokens, TROVE_MANAGER_LIST]})
}

module.exports = {
  bevm: {
    tvl,
  }
}
