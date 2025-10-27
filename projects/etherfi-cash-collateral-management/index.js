const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');


const EtherFiCashFactory = '0xF4e147Db314947fC1275a8CbB6Cde48c510cd8CF';
const CashBorrowerHelperContract = '0xF0df37503714f08d0fCA5B434F1FFA2b8b1AF34B';


//Get all the collateral held by cash borrow mode vaults which can be used to borrow against
async function getCollateralInCashBorrowMode(api, config) {

  const collateralTokensToAmount = {};

  const { timestamp } = api;
  const scroll_api = new sdk.ChainApi({ timestamp, chain: 'scroll' });

  //get last collateral mode vault
  const lastCollateralModeVault = (await scroll_api.call({
    target: EtherFiCashFactory,
    abi: 'function numContractsDeployed() view returns (uint256)',
  })) - 1;
  
  const batch_size = 300; 
  
  const calls = [];
  for (let i = 0; i < Number(lastCollateralModeVault); i += batch_size) {
    const startIndex = i;
    const endIndex = Math.min(i + batch_size, lastCollateralModeVault);
    const n = endIndex - startIndex;
    
    calls.push({
      target: CashBorrowerHelperContract,
      abi: 'function getTotalCollateralForSafesWithIndex(uint256 startIndex, uint256 n) view returns (tuple(address token, uint256 amount)[])',
      params: [startIndex, n],
    });
  }

  const parallelBatchSize = 30;
  const batches = [];
  for (let i = 0; i < calls.length; i += parallelBatchSize) {
    batches.push(calls.slice(i, Math.min(i + parallelBatchSize, calls.length)));
  }

  // Execute batches in parallel
  for (const [batchIndex, batch] of batches.entries()) {
      const batchPromises = batch.map(call => scroll_api.call(call));
      const batchResults = await Promise.all(batchPromises);
      
      // Process results
      batchResults.forEach((result, index) => {
        if (Array.isArray(result)) {
          for (const [token, amount] of result) {
            // Validate amount before adding
            if (amount && amount !== 'Infinity' && !isNaN(Number(amount))) {
              collateralTokensToAmount[token] = (collateralTokensToAmount[token] || 0n) + BigInt(amount);
            } else {
              console.warn('Invalid amount for token:', token, amount)
            }
          }
        }
      });
  }

  const result = {};
  for (const [token, amount] of Object.entries(collateralTokensToAmount)) {
    result[token] = amount.toString();
  }

  return result;
}

async function tvl(api) {
  const collateralTokensToAmount = await getCollateralInCashBorrowMode(api);
  for (const [token, amount] of Object.entries(collateralTokensToAmount)) {
    api.add(token, amount);
  } 
}

async function borrow(api) {
  const cashDebitCore = '0x0078C5a459132e279056B2371fE8A8eC973A9553'
  const usdcScroll = ADDRESSES.scroll.USDC
  const { timestamp } = api;
  const scroll_api = new sdk.ChainApi({ timestamp, chain: 'scroll' });
  const borrowingAmount  = await scroll_api.call({
    target: cashDebitCore,
    abi: 'function totalBorrowingAmount(address borrowToken) view returns (uint256)',
    params: [usdcScroll],
  });
  api.add(usdcScroll, borrowingAmount);
}

module.exports = {
  misrepresentedTokens: true,
  scroll: {
    tvl, 
    borrowed: borrow,
  },
};
