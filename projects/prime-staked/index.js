const DEPOSIT_POOL = "0xa479582c8b64533102f6f528774c536e354b8d32";

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
    "Returns the total assets owned by primeETH",
  ethereum: {
    tvl,
  },
};
