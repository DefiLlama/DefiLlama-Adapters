const ADDRESSES = require('../helper/coreAssets.json')
const twinUSDCAddress = '0x1b7678F6991b8dCcf9bB879929e12f1005d80E94';
const depositContractAddress = '0xF77B36ba4691c5e3e022D9e7b5a8f78103ccC57a'; 

async function tvl(api) {
  // Get the amount of twinUSDC or USDC held by the deposit contract
  const depositedAmount = await api.call({
    abi: 'erc20:balanceOf',
    target: twinUSDCAddress, // The token contract
    params: [depositContractAddress], // The contract holding the deposits
  });
  api.add(ADDRESSES.berachain.USDC, depositedAmount);
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL is calculated based on the amount of twinUSDC tokens held in the deposit contract, each representing 1 USDC in value.',
  berachain: {
    tvl
  }
};