const sdk = require('@defillama/sdk');

// Define the contract addresses and the AMM pool address
const MCS_TOKEN_ADDRESS = '0xDa5aC8F284537d6eaB198801127a9d49b0CbDff5';
const USDC_TOKEN_ADDRESS = '0xfa9343c3897324496a05fc75abed6bac29f8a40f';
const STAKING_CONTRACT_ADDRESS  = '0x258FC83E130Bc708541c33900bAEDE83242646db';

async function tvl(chainBlocks) {
  const balances = {};
  // Get the total locked value of the MCS token in the MCS Staking protocol
  const mcsLocked = await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'kava',
    target: MCS_TOKEN_ADDRESS,
    params: [STAKING_CONTRACT_ADDRESS ],
    block: chainBlocks['Kava'],
  });

  // Sum the total MCS token balance into the balances object
  sdk.util.sumSingleBalance(balances, MCS_TOKEN_ADDRESS, mcsLocked.output);
 
  // Get the total locked value of the USDC token in the MCS Staking protocol
  const usdcLocked = await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'kava',
    target: USDC_TOKEN_ADDRESS,
    params: [STAKING_CONTRACT_ADDRESS ],
    block: chainBlocks['Kava'],
  });

  // Convert the USDC balance from 6 decimal places to 18 decimal places
   const usdcAmountConverted = BigInt(usdcLocked.output) / BigInt(10 ** 6);

  // Sum the total USDC token balance into the balances object
  sdk.util.sumSingleBalance(balances, 'usd', usdcAmountConverted.toString());

  return balances; // Return the final balances object
}

module.exports = {
  
  kava : {
    tvl,
    methodology: `To obtain the TVL of the MCS token locked in the MCS Staking protocol , we make two calls to the Kava blockchain using the DefiLlama SDK:
    1. We call the 'balanceOf' method of the MCS token contract to get the total number of MCS tokens locked in the MCS Staking protocol.
    2. We call the 'balanceOf' method of the USDC token contract to get the total number of USDC tokens locked in the MCS Staking protocol.
    We then sum the two values to obtain the total value locked (TVL) in USD.`,
  }
 
}; // node test.js projects/mcs/index.js
