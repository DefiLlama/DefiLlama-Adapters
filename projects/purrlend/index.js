const POOL_ADDRESS = "0xb61218d3efE306f7579eE50D1a606d56bc222048"

const abi = {
  getReservesList: "function getReservesList() view returns (address[])",
  getReserveData:
    "function getReserveData(address asset) view returns (tuple(uint256,uint128,uint128,uint128,uint128,uint128,uint40,address,address,address,address,uint8))",
}

async function tvl(api) {
  const reserves = await api.call({
    target: POOL_ADDRESS,
    abi: abi.getReservesList,
  })

  const reserveData = await api.multiCall({
    abi: abi.getReserveData,
    calls: reserves.map(r => ({
      target: POOL_ADDRESS,
      params: [r],
    })),
  })

  const aTokens = reserveData.map(i => i[8])

  const supplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: aTokens,
  })

  supplies.forEach((supply, i) => {
    api.add(reserves[i], supply)
  })
}

module.exports = {
  methodology:
    "TVL counts total supplied liquidity in the Purrlend Aave v3 markets.",
  hyperliquid: {
    tvl,
  },
}