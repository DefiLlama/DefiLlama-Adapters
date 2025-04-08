const ADDRESSES = require('../helper/coreAssets.json')
const erc20Abi = {
  balanceOf: 'function balanceOf(address) view returns (uint256)',
  totalSupply: 'function totalSupply() view returns (uint256)' // Kept for reference, but unused now
};

const usdcAddress = ADDRESSES.berachain.USDC; 
const twinUSDCAddress = '0x1b7678F6991b8dCcf9bB879929e12f1005d80E94';
// Replace with the actual address of your deposit/staking/vault contract
const depositContractAddress = '0xF77B36ba4691c5e3e022D9e7b5a8f78103ccC57a'; 

async function tvl(api) {
  // Get the amount of twinUSDC or USDC held by the deposit contract
  const depositedAmount = await api.call({
    abi: erc20Abi.balanceOf,
    target: twinUSDCAddress, // The token contract
    params: [depositContractAddress], // The contract holding the deposits
  });
  console.log('Deposited Amount:', depositedAmount);

  return {
    [`berachain:${usdcAddress}`]: depositedAmount.toString()
  };
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL is calculated based on the amount of twinUSDC tokens held in the deposit contract, each representing 1 USDC in value.',
  berachain: {
    tvl
  }
};