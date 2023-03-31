const sdk = require('@defillama/sdk');

// Define the contract addresses and the AMM pool address
const MCS_TOKEN_ADDRESS = '0xDa5aC8F284537d6eaB198801127a9d49b0CbDff5';
const USDC_TOKEN_ADDRESS = '0xfa9343c3897324496a05fc75abed6bac29f8a40f';
const AMM_POOL_ADDRESS = '0x735EE52B88f1c4110Df36B62C335534544143a04';

async function tvl(chainBlocks) {
  const balances = {};

  // Get the total locked value of the MCS token in the VolatileV1 AMM pool
  const mcsLocked = await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'kava',
    target: MCS_TOKEN_ADDRESS,
    params: [AMM_POOL_ADDRESS],
    block: chainBlocks['Kava'],
  });

  // Sum the total MCS token balance into the balances object
  sdk.util.sumSingleBalance(balances, MCS_TOKEN_ADDRESS, mcsLocked.output);
 
  // Get the total locked value of the USDC token in the VolatileV1 AMM pool
  const usdcLocked = await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'kava',
    target: USDC_TOKEN_ADDRESS,
    params: [AMM_POOL_ADDRESS],
    block: chainBlocks['Kava'],
  });

  // Convert the USDC balance from 6 decimal places to 18 decimal places
  const usdcAmountConverted = parseInt(usdcLocked.output) * (10 ** 12);

  // Sum the total USDC token balance into the balances object
  sdk.util.sumSingleBalance(balances, USDC_TOKEN_ADDRESS, usdcAmountConverted);

  return balances; // Return the final balances object
}

module.exports = {
  
  kava : {
    tvl,
    methodology: `To obtain the TVL of the MCS token locked in the VolatileV1 AMM pool , we make two calls to the Kava blockchain using the DefiLlama SDK:
    1. We call the 'balanceOf' method of the MCS token contract to get the total number of MCS tokens locked in the VolatileV1 AMM pool.
    2. We call the 'balanceOf' method of the USDC token contract to get the total number of USDC tokens locked in the VolatileV1 AMM pool.
    We then sum the two values to obtain the total value locked (TVL) in USD.`,
  }
 
}; // node test.js projects/mcs/index.js
