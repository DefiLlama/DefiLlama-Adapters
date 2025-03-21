const sdk = require('@defillama/sdk');

const LENDING_POOL = '0x09e7b6BF92ba8566939d59fE3e3844385d492E77';

const RESERVES = {
  XFI: {
    symbol: 'XFI',
    address: '0xC537D12bd626B135B251cCa43283EFF69eC109c4',
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

const getReserveDataABI = 'function getReserveData(address asset) view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id))';

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  try {
    // Get reserve data for all assets
    const reserveData = await sdk.api.abi.multiCall({
      target: LENDING_POOL,
      abi: getReserveDataABI,
      calls: Object.values(RESERVES).map(r => ({ params: [r.address] })),
      chain: 'crossfi',
      block: chainBlocks['crossfi']
    });

    // Get aToken balances
    const aTokenBalances = await Promise.all(
      reserveData.output.map((data, i) => {
        if (!data.success || !data.output.aTokenAddress) return 0;
        return sdk.api.erc20.totalSupply({
          target: data.output.aTokenAddress,
          chain: 'crossfi',
          block: chainBlocks['crossfi']
        }).then(b => b.output);
      })
    );

    // Add balances
    Object.values(RESERVES).forEach((reserve, i) => {
      const balance = aTokenBalances[i];
      if (balance && balance !== '0') {
        sdk.util.sumSingleBalance(balances, reserve.address, balance, 'crossfi');
        console.log(`${reserve.symbol} TVL:`, balance / (10 ** reserve.decimals));
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
      abi: getReserveDataABI,
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
    - TVL: Total supply of aTokens, representing the total deposits
    - Borrows: Sum of stable and variable debt token balances
    - Net TVL: Total deposits minus total borrows

    Supported assets:
    - XFI (Native CrossFi token, 18 decimals)
    - WETH (from Base, 18 decimals)
    - USDC (from Base, 6 decimals)
    - USDT (from Arbitrum, 6 decimals)
    - WBTC (from Arbitrum, 8 decimals)

    The protocol uses AAVE v2 style lending where:
    - Deposits are represented by aTokens (interest-bearing tokens)
    - Borrows are tracked through stableDebtTokens and variableDebtTokens
    - Asset prices are provided by DIA Oracle
    - Liquidation thresholds and loan-to-value ratios are set per asset`,
  crossfi: {
    tvl,
    borrowed,
  },
};