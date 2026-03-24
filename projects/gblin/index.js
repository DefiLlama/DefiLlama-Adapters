// Protocol Name: Global Balanced Liquidity Index (GBLIN)
// Website: https://gblin.vercel.app/
// X (Twitter): @GBLIN_Protocol
// Network: Base

const sdk = require('@defillama/sdk');

const GBLIN_VAULT = '0xc475851f9101A2AC48a84EcF869766A94D301FaA';

// Gli asset reali che garantiscono GBLIN (WETH, cbBTC, USDC su Base)
const TOKENS = [
  '0x4200000000000000000000000000000000000006', // WETH
  '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', // cbBTC
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'  // USDC
];

async function tvl(api) {
  return api.sumTokens({ owner: GBLIN_VAULT, tokens: TOKENS });
}

module.exports = {
  methodology: "TVL is calculated by summing the WETH, cbBTC, and USDC strictly locked as backing collateral inside the GBLIN Autonomous Central Bank contract on Base.",
  base: {
    tvl
  }
};
