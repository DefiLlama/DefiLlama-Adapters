const USDC = '0x549943e04f40284185054145c6E4e9568C1D3241';
const HONEY = '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce';

// https://infrared.finance/docs/developers/contract-deployments
const infrared = '0x59945c5be54ff1d8deb0e8bc7f132f950da910a2';

const zooBribeVaultHoneyUsdc = '0x33C42E171cFD7Ec85D3dB34D7f6d3D8121f64E63';

// https://docs.swap.berachain.com/developers
const beraSwapVault = '0x4Be03f781C497A489E3cB0287833452cA9B9E80B';
const beraSwapLpHoneyUsdc = '0xf961a8f6d8c69e7321e78d254ecafbcc3a637621';

function findIndexIgnoreCase(arr, target) {
  return arr.findIndex(item => item.toLowerCase() === target.toLowerCase());
}

async function calcLpTvl(api, lpBalance, beraSwapLpPool, token0, token1) {
  const lpTotalSupply = await api.call({
    abi: 'function getActualSupply() public view returns (uint256)',
    target: beraSwapLpPool,
    params: [],
  });

  const lpPoolId = await api.call({
    abi: 'function getPoolId() public view returns (bytes32)',
    target: beraSwapLpPool,
    params: [],
  });

  const poolTokens = await api.call({
    abi: 'function getPoolTokens(bytes32 poolId) external view returns (address[] memory tokens, uint256[] memory balances, uint256 lastChangeBlock)',
    target: beraSwapVault,
    params: [lpPoolId],
  });
  const poolBalanceToken0 = poolTokens.balances[findIndexIgnoreCase(poolTokens.tokens, token0)];
  const poolBalanceToken1 = poolTokens.balances[findIndexIgnoreCase(poolTokens.tokens, token1)];

  const tvlToken0 = lpBalance * poolBalanceToken0 / lpTotalSupply;
  const tvlToken1 = lpBalance * poolBalanceToken1 / lpTotalSupply;

  api.add(token0, tvlToken0);
  api.add(token1, tvlToken1);
}

module.exports = {
  calcLpTvl,
  CONTRACTS: {
    USDC,
    HONEY,
    infrared,
    zooBribeVaultHoneyUsdc,
    beraSwapVault,
    beraSwapLpHoneyUsdc,
  }
};