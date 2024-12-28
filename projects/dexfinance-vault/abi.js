exports.abi = {
  factory: {
    vaultsLength: "function vaultsCount() view returns (uint256)",
    vaults: "function vaults(uint256 index) view returns (address)",
    farmCalculationConnector:
      "function farmCalculationConnector(address) view returns (address)",
  },
  vault: {
    liquidity: "function liquidity(address) view returns (uint256 liquidity_)",
    farmsLength: "uint256:farmsCount",
    farmConnector: "function farmConnector(address) view returns (address)",
    farms:
      "function farms(uint256 index) view returns (tuple(address beacon, uint256 percent, bytes data))",
  },
  farm: {
    stakingToken: "function stakingToken() view returns (address)",
    farm: "address:farm",
    type: "string:stakingTokenType",
    tokenId: "uint256:tokenId",
    stakingTokenLiquidity:
      "function stakingTokenLiquidity(uint256 tokenId_) view returns (uint256 liquidity_)",
    stakingTokenData:
      "function stakingTokenData() view returns ((string stakingTokenType, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, (uint256 sqrtPriceX96LowInit, uint256 sqrtPriceX96UpInit, uint256 sqrtPriceX96LowLimit, uint256 sqrtPriceX96UpLimit, uint256 sqrtPriceX96ApproxPricePercent, uint256 sqrtPriceX96ShiftPercentLow, uint256 sqrtPriceX96ShiftPercentUp, uint256 sqrtPriceX96DefaultShiftPercentLow, uint256 sqrtPriceX96DefaultShiftPercentUp) pricesData, (address tokenIn, address tokenOut)[] swapsToken0ToNative, (address tokenIn, address tokenOut)[] swapsToken1ToNative, (address tokenIn, address tokenOut)[] swapsNativeToToken0, (address tokenIn, address tokenOut)[] swapsNativeToToken1))",
  }
};
