const sdk = require('@defillama/sdk');
const { sumTokens2, } = require('../helper/unwrapLPs');

const LENDING_POOL = '0x09e7b6BF92ba8566939d59fE3e3844385d492E77';

// Full list of supported assets from the dashboard with decimals
const SUPPORTED_TOKENS = {
  // Native and wrapped native
  XFI: {
    address: '0xC537D12bd626B135B251cCa43283EFF69eC109c4',    // WXFI (Native CrossFi token)
    decimals: 18,
    from: 'native'
  },
  
  // Ethereum ecosystem
  WETH: {
    address: '0xa084d905e3F35C6B86B5E672C2e72b0472ddA1e3',   // WETH (from Base)
    decimals: 18,
    from: 'base'
  },
  
  // Stablecoins
  USDC: {
    address: '0x7bBcE15166bBc008EC1aDF9b3D6bbA0602FCE7Ba',   // USDC (from Base)
    decimals: 6,
    from: 'base'
  },
  USDT: {
    address: '0x38E88b1ed92065eD20241A257ef3713A131C9155',   // USDT (from Arbitrum)
    decimals: 6,
    from: 'arbitrum'
  },
  
  // Bitcoin ecosystem
  WBTC: {
    address: '0x417c85B9D0826501d7399FEeF417656774d333cc',   // WBTC (from Arbitrum)
    decimals: 8,
    from: 'arbitrum'
  },
  
  // Binance ecosystem
  BNB: {
    address: '0x40F6226bB42E440655D5741Eb62eE95d0159F344',    // WBNB (from BSC)
    decimals: 18,
    from: 'bsc'
  },
  
  // Solana ecosystem
  SOL: {
    address: '0x5b9bec66bB3d1559Fc6E05bfCAE7a1b5cdf678BE',    // SOL (from Solana)
    decimals: 18,
    from: 'solana'
  },
};

const SUPPORTED_TOKEN_ADDRESSES = Object.values(SUPPORTED_TOKENS).map(t => t.address);

async function tvl(api) {
  // Get actual token balances in the lending pool
  const tokensAndOwners = SUPPORTED_TOKEN_ADDRESSES.map(t => [t, LENDING_POOL]);
  const balances = await sumTokens2({ api, tokensAndOwners });

  // Log balances for debugging (will be visible in DeFi Llama test output)
  sdk.log('PhoLend TVL Balances:', balances);

  return balances;
}

async function borrowed(api) {
  const balances = {};
  
  const reserveData = await api.multiCall({
    abi: 'function getReserveData(address asset) view returns (tuple(uint256 data) configuration, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id)',
    calls: SUPPORTED_TOKEN_ADDRESSES.map(t => ({ target: LENDING_POOL, params: t }))
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

  SUPPORTED_TOKEN_ADDRESSES.forEach((token, i) => {
    const stableDebt = stableDebtTotals[i] || 0;
    const variableDebt = variableDebtTotals[i] || 0;
    const totalDebt = stableDebt + variableDebt;
    if (totalDebt > 0) sdk.util.sumSingleBalance(balances, token, totalDebt, api.chain);
  });

  // Log borrowed amounts for debugging
  sdk.log('PhoLend Borrowed Amounts:', balances);

  return balances;
}

module.exports = {
  methodology: `Measures the total value locked (TVL) in the PhoLend protocol on CrossFi chain:
    - TVL: Actual token balances held in the lending pool contract
    - Borrows: Sum of all stable and variable debt tokens for each asset
    - Net TVL: Total assets minus total borrows

    Supported assets (all priced via DIA Oracle):
    - XFI (Native CrossFi token, 18 decimals)
    - WETH (from Base, 18 decimals)
    - USDC (from Base, 6 decimals)
    - USDT (from Arbitrum, 6 decimals)
    - WBTC (from Arbitrum, 8 decimals)
    - BNB (from BSC, 18 decimals)
    - SOL (from Solana, 18 decimals)

    All asset prices are fetched through DeFi Llama's price API and converted to USD.
    New assets added to the protocol will be automatically tracked as long as:
    1. They are added to the lending pool
    2. They have price feeds available
    
    The protocol uses a classical lending protocol style where:
    - Deposits are represented by pTokens (interest-bearing tokens)
    - Borrows are tracked through stableDebtTokens and variableDebtTokens
    - Asset prices are provided by DIA Oracle
    - Liquidation thresholds and loan-to-value ratios are set per asset`,
  crossfi: {
    tvl,
    borrowed,
  },
};