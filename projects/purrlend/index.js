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

  for (let i = 0; i < reserves.length; i++) {
    const underlying = reserves[i]
    const aToken = reserveData[i][8] // aTokenAddress

    const balance = await api.call({
      abi: 'erc20:balanceOf',
      target: underlying,
      params: [aToken],
    })

    api.add(underlying, balance)
  }
}

module.exports = {
  methodology:
    "TVL counts total supplied liquidity in the Purrlend Aave v3 markets.",
  hyperliquid: {
    tvl,
  },
}