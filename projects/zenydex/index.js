const { sumTokens2 } = require('../helper/unwrapLPs');

const COLLATERAL_CONTRACT = '0x604b9926E40fD04A5145122930408b13243cD2Bb'; // your Collateral contract address on Base
const FUNDING_BOOK_CONTRACT = '0xF1e4944cd45ED647c57A10B3D88D974d84E68145'; // your FundingBook contract address on Base

const WETH_BASE = '0x4200000000000000000000000000000000000006';
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

async function tvl(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      [WETH_BASE, COLLATERAL_CONTRACT],
      [USDC_BASE, FUNDING_BOOK_CONTRACT],
    ]
  });
}

module.exports = {
  methodology: 'TVL is the sum of WETH collateral deposits and USDC lending liquidity held in ZenyDex protocol contracts.',
  base: {
    tvl,
  }
};