const POOL_CONTRACT_BASE = '0x1bE87D273d47C3832Ab7853812E9A995A4DE9EEA';
const POOL_CONTRACT_ARBITRUM = '0x9Be2Cf73E62DD3b5dF4334D9A36888394822A33F';
const WETH_ADDRESS_BASE = '0x4200000000000000000000000000000000000006';
const WBTC_ADDRESS_ARBITRUM = '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f'
async function tvlBase(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: WETH_ADDRESS_BASE,
    params: [POOL_CONTRACT_BASE],
  });

  //check our pools collateralBalance
  api.add(WETH_ADDRESS_BASE, collateralBalance)
}


async function tvlArbitrum(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: WBTC_ADDRESS_ARBITRUM,
    params: [POOL_CONTRACT_ARBITRUM],
  });

  //check our pools collateralBalance
  api.add(WBTC_ADDRESS_ARBITRUM, collateralBalance)
}

module.exports = {
  methodology: 'checks our pools collateral balances',
  base: {
    tvl: tvlBase,
  },
  arbitrum: {
    tvl: tvlArbitrum,
  }
}; 