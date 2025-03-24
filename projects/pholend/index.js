const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');

const LENDING_POOL = '0x09e7b6BF92ba8566939d59fE3e3844385d492E77';
const PROTOCOL_DATA_PROVIDER = '0x4D38f23A09c946667c59Ef89C812725F73DAfCd5';

const RESERVES = {
  XFI: {
    symbol: 'XFI',
    address: ADDRESSES.crossfi.WXFI,
    decimals: 18
  },
  WETH: {
    symbol: 'WETH',
    address: '0xa084d905e3F35C6B86B5E672C2e72b0472ddA1e3',
    decimals: 18
  },
  USDC: {
    symbol: 'USDC',
    address: '0x7bBcE15166bBc008EC1aDF9b3D6bbA0602FCE7Ba',
    decimals: 6
  },
  USDT: {
    symbol: 'USDT',
    address: '0x38E88b1ed92065eD20241A257ef3713A131C9155',
    decimals: 6
  },
  WBTC: {
    symbol: 'WBTC',
    address: '0x417c85B9D0826501d7399FEeF417656774d333cc',
    decimals: 8
  }
};

const getReserveDataABI = 'function getReserveData(address asset) view returns (tuple(uint256 availableLiquidity, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp))';

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  try {
    // Get reserve data for all assets using Protocol Data Provider
    const reserveData = await sdk.api.abi.multiCall({
      target: PROTOCOL_DATA_PROVIDER,
      abi: getReserveDataABI,
      calls: Object.values(RESERVES).map(r => ({ params: [r.address] })),
      chain: 'crossfi',
      block: chainBlocks['crossfi']
    });

    // Process reserve data
    reserveData.output.forEach((data, i) => {
      if (!data.success) return;
      const reserve = Object.values(RESERVES)[i];
      const { availableLiquidity } = data.output;
      
      if (availableLiquidity && availableLiquidity !== '0') {
        sdk.util.sumSingleBalance(balances, reserve.address, availableLiquidity, 'crossfi');
        console.log(`${reserve.symbol} TVL:`, availableLiquidity / (10 ** reserve.decimals));
      }
    });
  } catch (e) {
    console.log('Error in TVL calculation:', e.message);
  }

  return balances;
}

async function borrowed(timestamp, block, chainBlocks) {
  const balances = {};

  try {
    // Get reserve data for all assets
    const reserveData = await sdk.api.abi.multiCall({
      target: LENDING_POOL,
      abi: 'function getReserveData(address asset) view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id))',
      calls: Object.values(RESERVES).map(r => ({ params: [r.address] })),
      chain: 'crossfi',
      block: chainBlocks['crossfi']
    });

    // Get debt token balances
    const [stableDebtTotals, variableDebtTotals] = await Promise.all([
      Promise.all(
        reserveData.output.map(data => {
          if (!data.success || !data.output.stableDebtTokenAddress) return 0;
          return sdk.api.erc20.totalSupply({
            target: data.output.stableDebtTokenAddress,
            chain: 'crossfi',
            block: chainBlocks['crossfi']
          }).then(b => b.output);
        })
      ),
      Promise.all(
        reserveData.output.map(data => {
          if (!data.success || !data.output.variableDebtTokenAddress) return 0;
          return sdk.api.erc20.totalSupply({
            target: data.output.variableDebtTokenAddress,
            chain: 'crossfi',
            block: chainBlocks['crossfi']
          }).then(b => b.output);
        })
      )
    ]);

    // Sum up all debt
    Object.values(RESERVES).forEach((reserve, i) => {
      const stableDebt = stableDebtTotals[i] || '0';
      const variableDebt = variableDebtTotals[i] || '0';
      const totalDebt = (BigInt(stableDebt) + BigInt(variableDebt)).toString();
      if (totalDebt && totalDebt !== '0') {
        sdk.util.sumSingleBalance(balances, reserve.address, totalDebt, 'crossfi');
        console.log(`${reserve.symbol} Borrowed:`, totalDebt / (10 ** reserve.decimals));
      }
    });
  } catch (e) {
    console.log('Error in borrowed calculation:', e.message);
  }

  return balances;
}

module.exports = {
  methodology: `Measures the total value locked (TVL) in the PhoLend protocol on CrossFi chain:
    - TVL: Available liquidity in the lending pool per asset (from Protocol Data Provider)
    - Borrows: Sum of stable and variable debt token balances
    - Net TVL: Total deposits minus total borrows

    Data is fetched from:
    - Protocol Data Provider for TVL
    - Direct debt token balances for borrows

    Supported assets:
    - XFI (Native CrossFi token, 18 decimals)
    - WETH (from Base, 18 decimals)
    - USDC (from Base, 6 decimals)
    - USDT (from Arbitrum, 6 decimals)
    - WBTC (from Arbitrum, 8 decimals)

    The protocol uses AAVE v2 style lending where:
    - TVL is tracked through Protocol Data Provider
    - Borrows are tracked through stableDebtTokens and variableDebtTokens
    - Asset prices are provided by DIA Oracle
    - Liquidation thresholds and loan-to-value ratios are set per asset`,
  crossfi: {
    tvl,
    borrowed,
  },
};