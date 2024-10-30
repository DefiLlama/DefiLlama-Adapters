

const abis = {
  backstopPool: {
    asset: "function asset() external view returns (address)",
  },
  swapPool: {
    asset: "function asset() external view returns (address)", 
    reserve: "function reserve() external view returns (uint256)",
  }
}

const AA = {
  ARB : [{
    BSP : "0x337B03C2a7482c6eb29d8047eA073119dc68a29A",
    WETH: "0x272dF896f4D0c97F65e787f861bb6e882776a155",
    USDC: "0x058a0875DB2168AF97bbf01043C3e8F751cCd9A8",
    WBTC: "0x411eF79fE9Df8Ba82A09c7e93FdE85AF5732BF12",
    ARB:  "0xE70292D6054B753214D555930e0F11CD7206Efeb",
    swapPools: [
      "0x272dF896f4D0c97F65e787f861bb6e882776a155",
      "0x058a0875DB2168AF97bbf01043C3e8F751cCd9A8",
      "0x411eF79fE9Df8Ba82A09c7e93FdE85AF5732BF12",
      "0xE70292D6054B753214D555930e0F11CD7206Efeb",
    ]
  }],
  BASE : [{
    BSP : "0x50841f086891fe57829ee0a809f8B10174892b69",
    WETH: "0x123456C6C27bb57013F4b943A0f032a0ab9c12eB",
    CBBTC: "0xa83a20F4dCaB1a63a9118E9E432932c8BEB39b85",

    swapPools: [
      "0x123456C6C27bb57013F4b943A0f032a0ab9c12eB",
      "0xa83a20F4dCaB1a63a9118E9E432932c8BEB39b85",
    ]
  }]
}



const tvlFactory = (pools) => async function tvl(api) {

  let swapPools = []
  for (const ensable of pools) {
    const BSPToken = await api.call({
      abi: abis.backstopPool.asset, 
      target: ensable.BSP
    });
    const BSPReserve = await api.call({
      abi: 'erc20:balanceOf',
      target: BSPToken,
      params: [ensable.BSP],
    });

    api.add(BSPToken, BSPReserve);

    swapPools = [...swapPools, ...ensable.swapPools];
  }



  const reserves =  await api.multiCall({  abi: abis.swapPool.reserve, calls: pools[0].swapPools})
  const tokens =  await api.multiCall({  abi: abis.swapPool.asset, calls: pools[0].swapPools})


  api.add(tokens, reserves);

}

module.exports = {
    arbitrum: { tvl: tvlFactory(AA.ARB) },
    base: { tvl: tvlFactory(AA.BASE) },
}
