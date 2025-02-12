const ADDRESSES = require('../helper/coreAssets.json')
const USDC_CONTRACT_BASE = ADDRESSES.base.USDC;
const CONDITIONAL_TOKENS_CONTRACT_BASE = '0x34AA5631BdAD51583845e5e82e2CAf6cE63bA64D';

async function tvl(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: USDC_CONTRACT_BASE,
    params: [CONDITIONAL_TOKENS_CONTRACT_BASE],
  });

  api.add(USDC_CONTRACT_BASE, collateralBalance)
}

module.exports = {
  methodology: 'TVL (Total Value Locked) refers to the total amount of USDC held in the Conditional Token smart contract, along with the USDC collateral provided to all O.LAB Prediction markets ever created.',
  start: 23899060,
  base: {
    tvl,
  }
};