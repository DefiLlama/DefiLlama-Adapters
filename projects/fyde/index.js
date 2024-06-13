const ADDRESSES = require('../helper/coreAssets.json')
const FYDE_CONTRACT = "0x87Cc45fFF5c0933bb6aF6bAe7Fc013b7eC7df2Ee";
const RESTAKING_AGGREGATOR = "0x3f69F62e25441Cf72E362508f4d6711d53B05341";
const YIELD_MANAGER = "0xB615A7E4D1Ed426470Ac2Df14F3153fA2DcCC3ba";
const ORACLE = "0x05198327206123E89c24ABd9A482316449bD2aEe"
const WETH = ADDRESSES.ethereum.WETH;

async function tvl(api) {
  const tokens = await api.fetchList({ lengthAbi: 'getAssetsListLength', itemAbi: 'assetsList', target: FYDE_CONTRACT })
  const bals = await api.multiCall({  abi: 'function totalAssetAccounting(address) view returns (uint256)', calls: tokens, target: FYDE_CONTRACT })
  api.addTokens(tokens, bals)

  // add restaking aggregator TVL
  const amountStakedETH = await api.call({
    abi: 'erc20:totalSupply',
    target: RESTAKING_AGGREGATOR,
    params: [],
  });

  api.add(WETH, amountStakedETH)

  
  // add tokens deployed to yield module. Check which token from tokens is a yield-token, map to the underlying and 
  // add balances to TVL
  const response = (await api.multiCall({
    calls: tokens.map(token => ({
      target: ORACLE,
      params: [token]
    })),
    abi: 'function yieldTokenToToken(address) external view returns (address)',
    withMetadata: true,
  })).map(x => x.output);

  let tokenInYieldManager = [];
  let balInYieldManager = []; 

  for (let i = 0; i < tokens.length; i++) {
    if (response[i] !== '0x0000000000000000000000000000000000000000') {
      tokenInYieldManager.push(response[i]);
      balInYieldManager.push(bals[i]);
    }
  }

  api.addTokens(tokenInYieldManager, balInYieldManager)
  
}

module.exports = {
  methodology: 'Read out balances from internal accounting for each asset in Fyde. Add ETH staked in LRT Aggregator.',
  ethereum: {
    tvl
  }
};