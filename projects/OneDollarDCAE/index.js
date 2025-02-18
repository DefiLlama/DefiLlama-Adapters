// OneDollarDCAE adapter for Arbitrum
const USDC_TOKEN_ADDRESS = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'; // USDC on Arbitrum
const WETH_TOKEN_ADDRESS = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'; // WETH on Arbitrum
const ONE_DOLLAR_DCAE_CONTRACT = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'; // OneDollarDCAE contract address

async function tvl(api) {
  // Get USDC balance in the contract
  const usdcBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: USDC_TOKEN_ADDRESS,
    params: [ONE_DOLLAR_DCAE_CONTRACT],
  });

  // Get WETH balance in the contract
  const wethBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: WETH_TOKEN_ADDRESS,
    params: [ONE_DOLLAR_DCAE_CONTRACT],
  });

  // Add balances to TVL
  api.add(USDC_TOKEN_ADDRESS, usdcBalance);
  api.add(WETH_TOKEN_ADDRESS, wethBalance);
}

module.exports = {
  methodology: 'Counts the USDC and WETH held in the OneDollarDCAE contract.',
  start: 305469991, // The actual block number when the contract was deployed
  arbitrum: {
    tvl,
  }
};
