const FYDE_CONTRACT = "0x87Cc45fFF5c0933bb6aF6bAe7Fc013b7eC7df2Ee";
const RESTAKING_AGGREGATOR = "0x3f69F62e25441Cf72E362508f4d6711d53B05341";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

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
}

module.exports = {
  methodology: 'Read out balances from internal accounting for each asset in Fyde. Add ETH staked in LRT Aggregator.',
  ethereum: {
    tvl
  }
};