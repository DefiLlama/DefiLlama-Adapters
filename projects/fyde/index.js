const FYDE_CONTRACT = "0x87Cc45fFF5c0933bb6aF6bAe7Fc013b7eC7df2Ee";

async function tvl(_, _1, _2, { api }) {
  const tokens = await api.fetchList({ lengthAbi: 'getAssetsListLength', itemAbi: 'assetsList', target: FYDE_CONTRACT })
  const bals = await api.multiCall({  abi: 'function totalAssetAccounting(address) view returns (uint256)', calls: tokens, target: FYDE_CONTRACT })
  api.addTokens(tokens, bals)
  // return api.sumTokens({ tokens, owner: FYDE_CONTRACT })
}

module.exports = {
  methodology: 'Read out balances from internal accounting for each asset in Fyde',
  ethereum: {
    tvl
  }
};