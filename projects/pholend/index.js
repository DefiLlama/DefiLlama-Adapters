const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs');

const LENDING_POOL = '0x09e7b6BF92ba8566939d59fE3e3844385d492E77';
const SUPPORTED_TOKENS = [
  '0xC537D12bd626B135B251cCa43283EFF69eC109c4', // WXFI
  '0xa084d905e3F35C6B86B5E672C2e72b0472ddA1e3', // WETH
  '0x7bBcE15166bBc008EC1aDF9b3D6bbA0602FCE7Ba', // USDC
  '0x417c85B9D0826501d7399FEeF417656774d333cc', // WBTC
  '0x38E88b1ed92065eD20241A257ef3713A131C9155', // USDT
  '0x40F6226bB42E440655D5741Eb62eE95d0159F344', // WBNB
  '0x5b9bec66bB3d1559Fc6E05bfCAE7a1b5cdf678BE'  // SOL
];

async function tvl(api) {
  // Get aToken addresses for each supported token
  const reserveData = await api.multiCall({
    abi: 'function getReserveData(address asset) view returns (tuple(uint256 data) configuration, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id)',
    calls: SUPPORTED_TOKENS.map(t => ({ target: LENDING_POOL, params: t }))
  });

  // Get total supply of aTokens (represents total deposits)
  const aTokenBalances = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: reserveData.map(i => i.aTokenAddress),
  });

  const balances = {};
  SUPPORTED_TOKENS.forEach((token, i) => {
    const totalSupply = aTokenBalances[i] || 0;
    if (totalSupply > 0) sdk.util.sumSingleBalance(balances, token, totalSupply, api.chain);
  });

  return balances;
}

async function borrowed(api) {
  const balances = {};
  
  const reserveData = await api.multiCall({
    abi: 'function getReserveData(address asset) view returns (tuple(uint256 data) configuration, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id)',
    calls: SUPPORTED_TOKENS.map(t => ({ target: LENDING_POOL, params: t }))
  });

  const [stableDebtTotals, variableDebtTotals] = await Promise.all([
    api.multiCall({
      abi: 'erc20:totalSupply',
      calls: reserveData.map(i => i.stableDebtTokenAddress),
    }),
    api.multiCall({
      abi: 'erc20:totalSupply',
      calls: reserveData.map(i => i.variableDebtTokenAddress),
    })
  ]);

  SUPPORTED_TOKENS.forEach((token, i) => {
    const stableDebt = stableDebtTotals[i] || 0;
    const variableDebt = variableDebtTotals[i] || 0;
    const totalDebt = stableDebt + variableDebt;
    if (totalDebt > 0) sdk.util.sumSingleBalance(balances, token, totalDebt, api.chain);
  });

  return balances;
}

module.exports = {
  methodology: `Measures the total value locked (TVL) in the PhoLend protocol on CrossFi chain:
    - Deposits: Calculated by getting the total supply of pTokens for each supported asset (XFI, WETH, USDC, WBTC, USDT, WBNB, SOL)
    - Borrows: Sum of all stable and variable debt tokens for each asset
    - Net TVL: Total deposits minus total borrows
    The protocol uses an classical Lending protocol style where:
    - Deposits are represented by pTokens (interest-bearing tokens)
    - Borrows are tracked through stableDebtTokens and variableDebtTokens
    - Liquidation thresholds and loan-to-value ratios are set per asset`,
  crossfi: {
    tvl,
    borrowed,
  },
};