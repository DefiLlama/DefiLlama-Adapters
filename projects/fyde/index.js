const ADDRESSES = require('../helper/coreAssets.json')
const FYDE_CONTRACT = "0x87Cc45fFF5c0933bb6aF6bAe7Fc013b7eC7df2Ee";
const RESTAKING_AGGREGATOR = "0x3f69F62e25441Cf72E362508f4d6711d53B05341";
const ORACLE = "0x05198327206123E89c24ABd9A482316449bD2aEe"
const WETH = ADDRESSES.ethereum.WETH;

async function tvl(api) {
  const tokens = await api.fetchList({ lengthAbi: 'getAssetsListLength', itemAbi: 'assetsList', target: FYDE_CONTRACT })
  const bals = await api.multiCall({  abi: 'function totalAssetAccounting(address) view returns (uint256)', calls: tokens, target: FYDE_CONTRACT })

  // add restaking aggregator TVL
  const amountStakedETH = await api.call({
    abi: 'erc20:totalSupply',
    target: RESTAKING_AGGREGATOR,
    params: [],
  });

  api.add(WETH, amountStakedETH)

  // add tokens deployed to yield module. Check which token from tokens is a yield-token, map to the underlying and 
  // add balances to TVL
  const response = await api.multiCall({
    target: ORACLE,
    calls: tokens,
    abi: 'function yieldTokenToToken(address) external view returns (address)',
  })
  const decimals = await api.multiCall({  abi: 'uint8:decimals', calls: tokens})

  for (let i = 0; i < tokens.length; i++) {
    if (response[i] !== ADDRESSES.null) {
      const balance = bals[i] / 10 ** (decimals[i] - 18)
      api.add(response[i], balance)
    } else 
      api.add(tokens[i], bals[i])
  }
}

module.exports = {
  methodology: 'Read out balances from internal accounting for each asset in Fyde in the YieldModule. Add ETH staked in LRT Aggregator.',
  ethereum: {
    tvl
  }
};