

const abis = {
  backstopPool: {
    asset: "function asset() external view returns (address)",
  },
  swapPool: {
    asset: "function asset() external view returns (address)", 
    reserve: "function reserve() external view returns (uint256)",
  }
}

const ARB_PORTAL = "0xcB94Eee869a2041F3B44da423F78134aFb6b676B";
const AA = {
  ARB : {
    BSP : "0x337B03C2a7482c6eb29d8047eA073119dc68a29A",
    WETH: "0x272dF896f4D0c97F65e787f861bb6e882776a155",
    USDC: "0x058a0875DB2168AF97bbf01043C3e8F751cCd9A8",
    WBTC: "0x411eF79fE9Df8Ba82A09c7e93FdE85AF5732BF12",
    ARB:  "0xE70292D6054B753214D555930e0F11CD7206Efeb",
  }
}



async function tvl(api) {
  const BSPToken = await api.call({
    abi: abis.backstopPool.asset, 
    target: AA.ARB.BSP
  });
  const BSPReserve = await api.call({
    abi: 'erc20:balanceOf',
    target: BSPToken,
    params: [AA.ARB.BSP],
  });

  const WETHToken = await api.call({
    abi: abis.swapPool.asset, 
    target: AA.ARB.WETH
  });
  const WETHReserve = await api.call({
    abi: abis.swapPool.reserve,
    target: AA.ARB.WETH
  });
  const USDCReserve = await api.call({
    abi: abis.swapPool.reserve,
    target: AA.ARB.USDC
  });
  const WBTCReserve = await api.call({
    abi: abis.swapPool.reserve,
    target: AA.ARB.WBTC
  });
  const ARBReserve = await api.call({
    abi: abis.swapPool.reserve,
    target: AA.ARB.ARB
  });
  const USDCToken = await api.call({
    abi: abis.swapPool.asset, 
    target: AA.ARB.USDC
  });
  const WBTC = await api.call({
    abi: abis.swapPool.asset, 
    target: AA.ARB.WBTC
  });
  const ARB = await api.call({
    abi: abis.swapPool.asset, 
    target: AA.ARB.ARB
  });




  api.add(BSPToken, BSPReserve);
  api.add(WETHToken, WETHReserve);
  api.add(USDCToken, USDCReserve);
  api.add(WBTC, WBTCReserve);
  api.add(ARB, ARBReserve);
}

module.exports = {
    arbitrum: { tvl },
    // base: { tvl },
}
