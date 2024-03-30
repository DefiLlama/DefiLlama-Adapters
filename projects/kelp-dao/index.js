const DEPOSIT_POOL = "0x036676389e48133B63a802f8635AD39E752D375D";

async function tvl(api) {
  const config = await api.call({  abi: 'address:lrtConfig', target: DEPOSIT_POOL})
  const tokens= await api.call({  abi: 'address[]:getSupportedAssetList', target: config})
  const bals = await api.multiCall({  abi: 'function getTotalAssetDeposits(address) external view returns (uint256)', calls: tokens, target: DEPOSIT_POOL})
  api.addTokens(tokens, bals);
  return api.getBalances()
}

module.exports = {
  doublecounted: true,
  methodology:
    "deposited LSTs in deposit pool, node delegator contracts and from them into eigenlayer strategy contracts",
  ethereum: {
    tvl,
  },
};
